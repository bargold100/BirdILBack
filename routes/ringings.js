//var express = require('express');
import express from "express";
import * as childProcess from "child_process";
import { parse } from 'json2csv';

export var router = express.Router();
//import {ringingsController} from './utils/ringingsController.js'
//var ringingsController = require('./utils/ringingsController')
import {getAll,getBirdByRing,getBirdByName, getPathByName, getPointsByName, getHeatMap, getDownloadPoints} from '../routes/utills/ringingsController.js'

import {getGrid,getGridByName} from '../routes/utills/ringingsController.js'


// get data about ringings from server 
//---------------- grid for ringings ------------


router.route("/grid/:bird_name").get(async function (req, res, next) {
  try {

      let name = req.params.bird_name;
      name = name.replace('+', ' ')
      let queryParams = req.query;
      var counts_per_cell_id = await getGridByName(name,queryParams);
      var get_all_cells = await getGrid();
      get_all_cells.forEach(poly => {
        //searching in the counts array the polygon plot name:
        if(counts_per_cell_id.find(element=> element._id==poly.properties.Plot)==undefined){
          counts_per_cell_id.push({_id: poly.properties.Plot,count:0})
        }
      });

      if(counts_per_cell_id.length>0){
        var min_value =    0
        var max_value =    Math.max(...counts_per_cell_id.map(o => o.count))

      //Adding colors fields:
      counts_per_cell_id.map(element => {
        //set color if there is a result in the polygon 
        if(element.count != 0){
        var currColor = gradient(element.count,min_value,max_value)
        element.color = currColor}
        //if no result set to black 
        else{
          //element.color = "#000000" //black for zeroes
          element.color = "transparent" //transperant for zeroes
        }

      })
    }
  res.send(counts_per_cell_id.sort());
  } catch (error) {
      next(error);
  }
});

// get data about ringings from server

//GET all sightings of bird_id

router.get("/ring/:bird_id", async function (req, res, next) {
  try {
    res.header("Access-Control-Allow-Origin", "*");
    var result = await getBirdByRing(parseInt(req.params.bird_id));
    res.send(result);
  } catch (error) {
    next(error);
  }
});
//get points of each bird that belongs to the specific spieces.
router.get("/points/:bird_name", async function (req, res, next) {
  try {
    res.header("Access-Control-Allow-Origin", "*");
    let name = req.params.bird_name;
    name = name.replace("+", " ");
    let queryParams = req.query;
    var result = await getPointsByName(name, queryParams);
    // let data = result.data;
    let data = result.map((birdRing) => {
      return {
        id: birdRing._id,
        points: birdRing.birds.map((bird) => {
          let coordinates = {};
          coordinates.lat = bird.Lat;
          coordinates.lng = bird.Long;
          coordinates.date = bird.TibuaDate;
          coordinates.Ring_Number = bird.Ring_Number;
          coordinates.record_type = bird.record_type;
          coordinates.sex = bird.sex;
          coordinates.tibua_country = bird.tibua_country;
          coordinates.ring_width = bird.ring_width
          return coordinates;
        }),
      };
    });

    res.send(data);
  } catch (error) {
    next(error);
  }
});

//get points of each bird for download.
router.get("/download/:bird_name", async function (req, res, next) {
  try {
    res.header("Access-Control-Allow-Origin", "*");
    let name = req.params.bird_name;
    name = name.replace("+", " ");
    let queryParams = req.query;
    var result = await getDownloadPoints(name, queryParams);
    const data = result.map(({ _id, ...rest }) => rest);
    
    //new
    // Convert JSON to CSV
    const csv = parse(data);
    //console.log(data.slice(0,3));
    // Set the response headers
    res.setHeader('Content-disposition', 'attachment; filename=data.csv');
    res.set('Content-Type', 'text/csv');

    // Send the CSV file to the client
    res.status(200).send(csv);
    
    //original
    //res.send(data);
  } catch (error) {
    next(error);
  }
});


//get paths of each bird that belongs to the specific spieces.
router.get("/paths/:bird_name", async function (req, res, next) {
  try {
    res.header("Access-Control-Allow-Origin", "*");
    let name = req.params.bird_name;
    name = name.replace("+", " ");
    let queryParams = req.query;
    console.log(queryParams);
    var result = await getPathByName(name, queryParams);
    if (result.length !== 0)
    {
    // let data = result.data;
    let data = result.map((birdRing) => {
      return {
        id: birdRing._id,
        points: birdRing.birds.map((bird) => {
          let coordinates = {};
          coordinates.lat = bird.Lat;
          coordinates.lng = bird.Long;
          return coordinates;
        }),
      };
    });

    //convert "data" to the formate that the python script need
    //convert from [{id:1, points:[{lat:2,lng:3},{lat:4, lng:5}]},{id:6, points:[{lat:7,lng:8}]}] to [[[2,3],[4,5]],[[7,8]]]
    const trajectories = data
      .map((obj) => obj.points.map((point) => [point.lat, point.lng]))
      .reduce((acc, arr) => {
        acc.push(arr);
        return acc;
      }, []);

    

    //read python script to get the aggregated paths
    // Convert the trajectories array to a string using JSON.stringify()
    const trajectoriesString = JSON.stringify(trajectories);
    // spawn a Python process with the arguments
    //const pythonProcess = childProcess.spawn('python', ['C:/Users/Win10/Desktop/final_project/birds_back_end_2023/algorithm/test.py', ...args]);
    const pythonProcess = childProcess.spawn("python", [
      process.env.ALGO_PY
    ]);
    pythonProcess.stdin.write(trajectoriesString);
    pythonProcess.stdin.end();
    let finalData;
    // handle standard output
    pythonProcess.stdout
      .on("data", (aggData) => {
        const outputData = JSON.parse(aggData.toString());
        const outputDataArray = Object.values(outputData);
        const maxNumOfPaths = outputDataArray.reduce((max, obj) => {
            return obj.num_of_paths > max ? obj.num_of_paths : max;
          }, 0);

          const minNumOfPaths = outputDataArray.reduce((min, obj) => {
            return obj.num_of_paths < min ? obj.num_of_paths : min;
          }, Infinity);

        const light_colors = ["#ad0202","#178700","#c90ac0","#db910f","#039e9e","#966018","#7104c4","#024296"];
        const dark_colors = ["#00bfff","#efff00","#bf00ff","#ff6700","#39ff14","#f62f5e","#5951fc","#00ffcc"];
        const mappedOutputData = outputDataArray.map((item, index) => {
            // normalize the weight between 2 and 15 when we are in aggregation
            const newWeight =
              (15 - 2) *
                ((item.num_of_paths - minNumOfPaths) /
                  (maxNumOfPaths - minNumOfPaths)) +
              2;
          return (
          {
          ...item,
          avg_path: item.avg_path.map(point => ({ lat: point[0], lng: point[1] })),
          weight:newWeight,
          light_color:light_colors[index],
          dark_color:dark_colors[index]


      })});
        // outputData.map((item) => item.avg_path.map((point) => ({lat:point[0], lng:point[1]}))  )
        finalData = { rawData: data, aggData: mappedOutputData };
        res.send(finalData);

      });
   
    // handle standard error
    pythonProcess.stderr.on("data", (errorData) => {
      console.error(`stderr: ${errorData}`);
      finalData = { rawData: data};
      //res.send(finalData);
    });

    // handle process exit
    pythonProcess.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
    });
  }
  else{
    res.send({rawData:[]});
  }
  } catch (error) {
    next(error);
  }
});
//get points of each bird that belongs to the specific spieces - for the heatmap.
router.get("/heatmap/:bird_name", async function (req, res, next) {
  try {
    res.header("Access-Control-Allow-Origin", "*");
    let name = req.params.bird_name;
    name = name.replace("+", " ");
    let queryParams = req.query;
    var result = await getHeatMap(name, queryParams);
    // let data = result.data;
    let data = result.map((birdRing) => {
      return {
        id: birdRing._id,
        points: birdRing.birds.map((bird) => {
          let coordinates = {};
          coordinates.lat = bird.Lat;
          coordinates.lng = bird.Long;
          return coordinates;
        }),
      };
    });
    res.send(data);
  } catch (error) {
    next(error);
  }
});
//GET all sightings of bird_name

router.get("/:bird_name", async function (req, res, next) {
  try {
    res.header("Access-Control-Allow-Origin", "*");
    let name = req.params.bird_name;
    name = name.replace("+", " ");
    var result = await getBirdByName(name);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

router.get("/", async function (req, res, next) {
  try {
    res.header("Access-Control-Allow-Origin", "*");
    var result = await getAll();

    //res.render("test",{output: 1234})
    console.log("result from GET ringings:");
    console.log(result);
    res.send(result);
    //console.log(len(res.data))
    //console.log(res.data)
    //console.log()
  } catch (error) {
    next(error);
  }
});

  //-------------------------  Color Functions --------------------------
  const gradient = (value, minValue, maxValue) => {
           
    //---pallettes:
    const hotColors = ['#FF5733', '#FFA233', '#FFD433', '#FFE733', '#FFFF33'];
    const coldColors = ['#19647E', '#007CC7', '#00C5E0', '#00FFFF', '#BDEDFD'];
    const gradientColors = coldColors.concat(hotColors.reverse());
    const fraction = (value - minValue) / (maxValue - minValue);
    const colorIndex = Math.round(fraction * (gradientColors.length-1));
    return gradientColors[colorIndex];
  };

//export default router

//export {default} ringingsRouter;
//module.exports = router;
