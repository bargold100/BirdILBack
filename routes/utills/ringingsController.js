import express from "express";
import { getDB } from "../../DB_utills/DB_utills.js";
import {getDataByFilters} from "./filtersController.js"
// retrives ringings data
export async function getAll() {
  const dbConnect = await getDB();
  const tibua_data = await dbConnect
    .collection("birds_ringing")
    .find({})
    .toArray();

  //console.log("tibua data from mongo:")
  //console.log(tibua_data)
  return tibua_data;
}

export async function getBirdByName(name) {
  const dbConnect = await getDB();
  const collection = await dbConnect.collection("birds_ringing");
  var query = { bird_name: name };
  const results = await collection.find(query).toArray();
  //const results = await collection.findOne(query);
  return results;
}
// //function that return the path from 2020 to show as the default
// export async function getBirdByName2020(name) {
//   const dbConnect = await getDB();
//   const collection = await dbConnect.collection("birds_ringing");
//   var query = { bird_name: name, TibuaDate: {$gte: ISODate("2020-01-01T00:00:00.000Z")}};
//   const results = await collection.find(query).toArray();
//   //const results = await collection.findOne(query);
//   return results;
// }

export async function getBirdByRing(ring) {
  const dbConnect = await getDB();
  const collection = await dbConnect.collection("birds_ringing");
  var query = { Ring_Number: ring };
  const results = await collection.find(query).toArray();
  //const results = await collection.findOne(query);
  return results;
}
//get all points of a bird by name
export async function getPointsByName(name, queryParams) {
  const dbConnect = await getDB();
  const collection = await dbConnect.collection("birds_ringing");
  const filtersPipeline = await getDataByFilters(queryParams);
  console.log('filtersPipeline :>> ', filtersPipeline);
  const pipeline = [
    ...filtersPipeline, 
    {
      $match: {
        bird_name: name,
      },
    },
    // {
    //   $group: {
    //     _id: "$Ring_Number",
    //     birds: {
    //       $push: "$$ROOT",
    //     },
    //   },
    // },

 {
    $group: {
      _id: {
        ringNumber: '$Ring_Number', 
        ringWidth: '$ring_width'
      }, 
      birds: {
        $push: '$$ROOT'
      }
    }
  }


  ];
  const aggCursor = collection.aggregate(pipeline);
  let ring_numbers = [];
  for await (const doc of aggCursor) {
    ring_numbers.push(doc);
  }
  
  //const results = await collection.findOne(query);
  return ring_numbers;
}

//get all points of a bird by name for download csv file
export async function getDownloadPoints(name, queryParams) {
  const dbConnect = await getDB();
  const collection = await dbConnect.collection("birds_ringing");
  const filtersPipeline = await getDataByFilters(queryParams);
  console.log('filtersPipeline :>> ', filtersPipeline);
  const pipeline = [
    ...filtersPipeline, // add the filters pipeline here
    {
      $match: {
        bird_name: name,
      },
    },

  ];
  const aggCursor = collection.aggregate(pipeline);
  let ring_numbers = [];
  for await (const doc of aggCursor) {
    ring_numbers.push(doc);
  }

  return ring_numbers;
}


//get path- birds with at least 2 points
export async function getPathByName(name, queryParams) {
  const dbConnect = await getDB();
  const collection = await dbConnect.collection("birds_ringing");
  const filtersPipeline = await getDataByFilters(queryParams);
  const pipeline = [
    ...filtersPipeline, // add the filters pipeline here
    {
      $match: {
        bird_name: name,
      },
    },
    {
      $sort: {
        TibuaDate: 1,
      },
    },
    {
      $group: {
        /*only ring number          */
        //  _id: "$Ring_Number",
        /* ring number and width     */

        _id: {
          ringNumber: '$Ring_Number', 
          ringWidth: '$ring_width'
        }, 
        birds: {
          $push: "$$ROOT",
        },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $match: {
        count: {
          $gte: 2,
        },
      },
    },
    {
      // check if in the path all the points are the same point
      $addFields: {
        all_coords_same: {
          $reduce: {
            input: "$birds",
            initialValue: true,
            in: {
              $cond: {
                if: {
                  $and: [
                    "$$value",
                    {
                      $eq: [
                        "$$this.Lat",
                        {
                          $arrayElemAt: [
                            "$birds.Lat",
                            0,
                          ],
                        },
                      ],
                    },
                    {
                      $eq: [
                        "$$this.Long",
                        {
                          $arrayElemAt: [
                            "$birds.Long",
                            0,
                          ],
                        },
                      ],
                    },
                  ],
                },
                then: true,
                else: false,
              },
            },
          },
        },
      },
    },
    {
      // filters out paths where all points are the same point
      $match:
        {
          all_coords_same: false,
        },
    },
    {
      $project:

        {
          _id: 1,
          birds: 1,
          count: 1,
        },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ];

 

  const aggCursor = collection.aggregate(pipeline);
  

  let ring_numbers = [];
  for await (const doc of aggCursor) {
    ring_numbers.push(doc);
  }
  

  //const results = await collection.findOne(query);
  return ring_numbers;
}


//get all points of a bird by name
export async function getHeatMap(name, queryParams) {
  const dbConnect = await getDB();
  const collection = await dbConnect.collection("birds_ringing");
  const filtersPipeline = await getDataByFilters(queryParams);
  const pipeline = [
    ...filtersPipeline, // add the filters pipeline here
    {
      $match: {
        //remove comment after hackathon
        // bird_name: name,
      },
    },
    {
      $group: {
        _id: "$Ring_Number",
        birds: {
          $push: "$$ROOT",
        },
      },
    },

  ];
  if(queryParams.year !== 0)
  {
    pipeline[0].$match.TibuaDate = {$gte: new Date(queryParams.year+"-01-01T00:00:00.000Z")}
  }
  
  const aggCursor = collection.aggregate(pipeline);
  let ring_numbers = [];
  for await (const doc of aggCursor) {
    ring_numbers.push(doc);
  }
  console.log(ring_numbers);

  //const results = await collection.findOne(query);
  return ring_numbers;
}




//------------------------Grid----------------------


//retrives grid cells
export async function getGrid() {
  const dbConnect = await getDB();
  const grid_cells = await dbConnect
    .collection("grid")
    .find({})
    .toArray();
  return grid_cells;
}

export async function getGridByName(name,queryParams) {

  const dbConnect = await getDB();
  //const collection = await dbConnect.collection("grid_sightings")
  const collection = await dbConnect.collection("birds_ringing")

  const filtersPipeline = await getDataByFilters(queryParams);
//===================

const pipeline = [...filtersPipeline,

  // switch to  upper code after finishing the grid functionallity 
  {
    $match:{ 
      //record_type:"ringing",
      bird_name: name, 
      cell: {$ne : ""},
  }
},
  {$group: {
      _id: "$cell",
      count: {
          $sum: 1,
        },
    },
  },

  {$project:{
      _id:1,
      count: 1,
      },
    },

  {$sort: {
      count: -1,
    },

  }

];

const aggCursor = collection.aggregate(pipeline);
let cells_data = [];
for await (const doc of aggCursor) {
  cells_data.push(doc);
}
aggCursor.close();
//const results = await collection.findOne(query);
return cells_data;



//==================

}
// module.exports.getAll = getAll;
// module.exports.getBirdByName = getBirdByName;
// module.exports.getBirdByRing = getBirdByRing;
