import express from "express";
import { getDB } from "../../DB_utills/DB_utills.js";


//retrives grid cells
export async function getGrid() {
    const dbConnect = await getDB();
    const grid_cells = await dbConnect
      .collection("grid")
      .find({})
      .toArray();
    return grid_cells;
  }

  export async function getRingigngsPerGridCells(queryParams) {

    const dbConnect = await getDB();
    //const collection = await dbConnect.collection("grid_sightings")
    const collection = await dbConnect.collection("birds_ringing")
//===================

const pipeline = [
    //{
    //   $match:{ 
    //     record_type:"ringing",
    //     bird_name: queryParams.birdName, 
    //     cell: {$ne : ""},
    //     TibuaDate: {
    //     $gte: queryParams.startDate,
    //     $lt:  queryParams.endDate},
    //     
    // }

    // switch to  upper code after finishing the grid functionallity 
    {$match:{ 
        record_type:"ringing",
        bird_name: "Sylvia curruca", 
        cell: {$ne : ""},
        TibuaDate: {
        $gte: new Date("01-01-2019"),
        $lt:  new Date("01-01-2024"),}

    }},
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

  