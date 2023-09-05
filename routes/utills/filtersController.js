import { getDB } from "../../DB_utills/DB_utills.js";


export const getDataByFilters = async (query_params) => {
  try {
   const { gender, observation, startDate, endDate, ringNum, ringWidth, dateKind, ringingArea, observationArea} = query_params;
   console.log('query_params :>> ', query_params);
    // const dbConnect = await getDB();
    const pipeline = [];
    if (gender !== "All" && gender !== "") {
      pipeline.push({ $match: { sex: gender } });
    }
    if (observation !== "All" && observation !== "") {
      pipeline.push({ $match: { record_type: observation } });
    }
    if (ringNum !== "" && ringWidth !== "") {
      pipeline.push({ $match: { Ring_Number:  parseInt(ringNum), ring_width: ringWidth } });
    }
    else if (ringNum !== "" && ringWidth === "") {
      pipeline.push({ $match: { Ring_Number:  parseInt(ringNum)} });
    }
    if (dateKind == "date") {
      if (startDate === "" && endDate === "") {
        startDate = "2017-01-01";
        pipeline.push({
          $match: {
            TibuaDate: { $gte: new Date(startDate), $lte: new Date() },
          },
        });
      } else {
        pipeline.push({
          $match: {
            TibuaDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
          },
        });
      }
    }
    else {
      const startYear = new Date(startDate).getFullYear();
      const startMonth = new Date(startDate).getMonth() + 1;
      const endYear = new Date(endDate).getFullYear();
      const endMonth = new Date(endDate).getMonth() + 1;
      pipeline.push({
        $match: {
          $expr: {
            $and: [
              { $gte: [{ $year: "$TibuaDate" }, startYear] },
              { $lte: [{ $year: "$TibuaDate" }, endYear] },
              { $gte: [{ $month: "$TibuaDate" }, startMonth] },
              { $lte: [{ $month: "$TibuaDate" }, endMonth] },
            ],
          },
        },
      });
    }
    if(ringingArea == "Israel"){
      pipeline.push({
        $match: {tibua_country: "Israel" }
      });
    }
    else if(ringingArea == "Abroad"){
      pipeline.push({
        $match: { tibua_country: { $ne: "Israel" } }
      });
    }
    if(observationArea == "Israel"){
      pipeline.push({
        $match: { cell: { $ne: "" }}
      });
    }
    else if(observationArea == "Abroad"){
      pipeline.push({
        $match: { cell: "" }
      });
    }
    console.log("pipeline: ", pipeline);
    console.log("successfully filtered data");
    // return filter_result;
    return pipeline;
  } catch (err) {
    console.log(err);
    throw new Error("Internal server error"); // throw an error if there's an error
  }
}

export const getTibuaLocationsData = async () => {
  try {
    const dbConnect = await getDB();
    const tibuaLocations_result = await dbConnect
      .collection("tibua_locations")
      .find({})
      .toArray();
    console.log("successfully filtered data");
    return tibuaLocations_result;
  } catch (err) {
    console.log(err);
    throw new Error("Internal server error"); // throw an error if there's an error
  }
}

// module.exports = getDataByFilters;
