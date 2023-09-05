import express from "express";
import { getDB } from "../../DB_utills/DB_utills.js";

// retrives names data
export async function getAllBirds() {
  const dbConnect = await getDB();
  const names_data = await dbConnect
    .collection("birds_names")
    .find({})
    .toArray();
  return names_data;
}

export async function getDetailsByEngName(clean_eng_name) {
  // print(eng_name)
  const dbConnect = await getDB();
  const collection = await dbConnect.collection("birds_names");
  var query = { clean_english_name: clean_eng_name };
  const results = await collection.find(query).toArray();

  return results;
}

export async function getDetailsByLatName(lat_name) {
  const dbConnect = await getDB();
  const collection = await dbConnect.collection("birds_names");
  var query = { latin_name: eng_name };
  const results = await collection.find(query).toArray();

  return results;
}
export async function insertBird(
  englishName,
  cleanEngName,
  latinName,
  hebrewName,
  bridImg
) {
  try {
    const dbConnect = await getDB();
    const collection = await dbConnect.collection("birds_names");

    //check if one of the names already in the database
    const isExistRes = await collection
      .find({
        $or: [
          { clean_english_name: cleanEngName },
          { hebrew_name: hebrewName },
          { latin_name: latinName },
        ],
      })
      .toArray();
    if (isExistRes.length === 0) {
      const isInserted = await collection.insertOne({
        english_name: englishName,
        clean_english_name: cleanEngName,
        latin_name: latinName,
        hebrew_name: hebrewName,
        bird_image: bridImg,
      });
      if (isInserted.acknowledged) {
        return true;
      } else {
        return false;
      }
    } //duplicate, bird already in the system
    else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function updateBird(oldParams, newParams) {
  try {
    const dbConnect = await getDB();
    const collection = await dbConnect.collection("birds_names");
    //check if one of the names already in the database
    const isExistRes = await collection
      .find({
        $or: [
          { clean_english_name: newParams.cleanEngName },
          { hebrew_name: newParams.hebrew_name },
          { latin_name: newParams.latin_name },
        ],
      })
      .toArray();
    if (isExistRes.length <= 1) {
      const newValue = { $set: newParams };
      const query = { latin_name: oldParams.latin_name };
      const isUpdated = await collection.findOneAndUpdate(query, newValue);
      // need to update birds_ringing
      if (oldParams.latin_name !== newParams.latin_name) {
        const newRingingValue = { $set: { bird_name: newParams.latin_name } };
        const ringingQuery = { bird_name: oldParams.latin_name };
        const ringingCollection = await dbConnect.collection("birds_ringing");
        const isRingingsUpdated = await ringingCollection.updateMany(ringingQuery,newRingingValue);
      }
      return true;
    } //duplicate,another bird already in the system with the at least one of the new params
    else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}
export async function removeBird(latinName) {
  try {
    const dbConnect = await getDB();
    const names_collection = await dbConnect.collection("birds_names");
    await names_collection.deleteMany(
      { latin_name: latinName },
      function (err, result) {
        if (err) throw err;
        console.log(
          `${result.deletedCount} documents deleted from birds_names`
        );
      }
    );
    const ringings_collection = await dbConnect.collection("birds_ringing");
    await ringings_collection.deleteMany(
      { bird_name: latinName },
      function (err, result) {
        if (err) throw err;
        console.log(
          `${result.deletedCount} documents deleted from birds_ringing`
        );
      }
    );
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
//==== unfinished ====

export async function getILRingIndi(eng_name) {
  const dbConnect = await getDB();
  const collection = await dbConnect.collection("birds_names");
  var query = { english_name: eng_name };
  const results = await collection.find(query).toArray();
  //filter the inidi field!

  ///,,,,,,,,,,,,,,,,,
  return results;
}
// module.exports.getAllBirds = getAllBirds;
// module.exports.getDetailsByLatName = getDetailsByLatName;
// module.exports.getDetailsByEngName = getDetailsByEngName;
