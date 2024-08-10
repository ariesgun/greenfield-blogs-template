import { client, selectSp } from "./client";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

export const listGreenfieldObjects = async ({ bucketName, retries = 5 }) => {
  console.log("BucketName", bucketName);
  let retry = 0;

  while (retry < retries) {
    try {
      const spInfo = await selectSp();
      const res = await client.object.listObjects({
        bucketName: bucketName,
        endpoint: spInfo.endpoint,
      });

      if (res.code === 0) {
        console.log("Ressss", res);
        return res.body.GfSpListObjectsByBucketNameResponse.Objects;
      } else {
        throw new Error("Error");
      }
    } catch (err) {
      retry++;
      const delayInSeconds = Math.max(
        Math.min(Math.pow(2, retry) + randInt(-retry, retry), 600),
        1
      );
      console.error(`Retrying after ${delayInSeconds} seconds due to:`, err);
      await delay(delayInSeconds * 1000);
    }
  }

  throw new Error("listObjects return non-zero error code");
};

export const listGreenfieldObjectsById = async ({ params, retries = 5 }) => {
  let retry = 0;

  while (retry < retries) {
    try {
      const listObjectTx = await client.object.listObjectsByIds({
        ids: [params.id],
      });

      if (listObjectTx.code === 0) {
        console.log("Ressss", listObjectTx);
        return listObjectTx.body.GfSpListObjectsByIDsResponse.ObjectEntry[0]
          .Value.ObjectInfo;
      } else {
        throw new Error("Error");
      }
    } catch (err) {
      retry++;
      const delayInSeconds = Math.max(
        Math.min(Math.pow(2, retry) + randInt(-retry, retry), 600),
        1
      );
      console.error(`Retrying after ${delayInSeconds} seconds due to:`, err);
      await delay(delayInSeconds * 1000);
    }
  }
  throw new Error("listObjectsByIds return non-zero error code", res);
};
