require("dotenv").config();

const {
  RedundancyType,
  VisibilityType,
  Client,
  Long,
  bytesFromBase64,
} = require("@bnb-chain/greenfield-js-sdk");

const fs = require("node:fs");
const path = require("node:path");

const { GREEN_CHAIN_ID, GRPC_URL } = process.env;
const { ACCOUNT_ADDRESS, ACCOUNT_PRIVATEKEY, BUCKET_NAME } = process.env;

const client = Client.create(GRPC_URL, String(GREEN_CHAIN_ID));
const mimeTypes = require("mime-types");
const { ReedSolomon } = require("@bnb-chain/reed-solomon");
const rs = new ReedSolomon();

const getSps = async () => {
  const sps = await client.sp.getStorageProviders();
  const finalSps = (sps ?? []).filter((v) => v.endpoint.includes("nodereal"));

  return finalSps;
};

const selectSp = async () => {
  const finalSps = await getSps();

  const selectIndex = Math.floor(Math.random() * finalSps.length);

  const secondarySpAddresses = [
    ...finalSps.slice(0, selectIndex),
    ...finalSps.slice(selectIndex + 1),
  ].map((item) => item.operatorAddress);
  const selectSpInfo = {
    id: finalSps[selectIndex].id,
    endpoint: finalSps[selectIndex].endpoint,
    primarySpAddress: finalSps[selectIndex]?.operatorAddress,
    sealAddress: finalSps[selectIndex].sealAddress,
    secondarySpAddresses,
  };

  return selectSpInfo;
};

async function createBucketIfNotPresent() {
  try {
    // const content = fs.readFileSync(filePath, { encoding: "base64" });

    // Get the file's content from GitHub to check if it exists
    let sha;
    let bucketObj = null;
    try {
      bucketObj = await client.bucket.headBucket("gnfd-press-" + BUCKET_NAME);
      //   console.log(bucketObj);
    } catch (error) {
      if (error.status !== 404) {
        bucketObj;
      }
    }

    try {
      if (!bucketObj) {
        const spInfo = await selectSp();
        const createBucketTx = await client.bucket.createBucket({
          bucketName: "gnfd-press-" + BUCKET_NAME,
          creator: ACCOUNT_ADDRESS,
          visibility: VisibilityType.VISIBILITY_TYPE_PUBLIC_READ,
          chargedReadQuota: Long.fromString("0"),
          primarySpAddress: spInfo.primarySpAddress,
          paymentAddress: ACCOUNT_ADDRESS,
        });
        const simulateInfo = await createBucketTx.simulate({
          denom: "BNB",
        });
        const res = await createBucketTx.broadcast({
          denom: "BNB",
          gasLimit: Number(simulateInfo?.gasLimit),
          gasPrice: simulateInfo?.gasPrice || "5000000000",
          payer: ACCOUNT_ADDRESS,
          granter: "",
          privateKey: ACCOUNT_PRIVATEKEY,
        });

        console.log(`Created bucket gnfd-press-${BUCKET_NAME}`);
      }
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
    }
  } catch (error) {
    console.error(
      `Failed to create bucket gnfd-press-${BUCKET_NAME}:`,
      error.message
    );
  }
}

async function createFolder(folderName) {
  try {
    // const content = fs.readFileSync(filePath, { encoding: "base64" });

    // Get the file's content from GitHub to check if it exists
    try {
      const spInfo = await selectSp();
      const createBucketTx = await client.bucket.createFolder({
        bucketName: "gnfd-press-" + BUCKET_NAME,
        objectName: folderName + "/",
        creator: ACCOUNT_ADDRESS,
        redundancyType: RedundancyType.REDUNDANCY_EC_TYPE,
        visibility: VisibilityType.VISIBILITY_TYPE_PUBLIC_READ,
      });
      const simulateInfo = await createBucketTx.simulate({
        denom: "BNB",
      });
      const res = await createBucketTx.broadcast({
        denom: "BNB",
        gasLimit: Number(simulateInfo?.gasLimit),
        gasPrice: simulateInfo?.gasPrice || "5000000000",
        payer: ACCOUNT_ADDRESS,
        granter: "",
        privateKey: ACCOUNT_PRIVATEKEY,
      });

      console.log(`Created bucket gnfd-press-${BUCKET_NAME}`);
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
    }
  } catch (error) {
    console.error(
      `Failed to create bucket gnfd-press-${BUCKET_NAME}:`,
      error.message
    );
  }
}

function createFile(path) {
  const stats = fs.statSync(path);
  const fileSize = stats.size;

  return {
    name: path,
    type: "",
    size: fileSize,
    content: fs.readFileSync(path),
  };
}

async function uploadFileGreenfield(filePath, repoPath) {
  console.log("Uploading ... ", filePath);
  try {
    const obj = await client.object.headObject(
      "gnfd-press-" + BUCKET_NAME,
      repoPath
    );
    console.log(obj);

    if (obj && obj.globalVirtualGroup !== undefined) {
      const tx = await client.object.deleteObject({
        bucketName: "gnfd-press-" + BUCKET_NAME,
        objectName: repoPath,
        operator: ACCOUNT_ADDRESS,
      });
      const simulateInfo = await tx.simulate({
        denom: "BNB",
      });

      const res = await tx.broadcast({
        denom: "BNB",
        gasLimit: Number(simulateInfo?.gasLimit),
        gasPrice: simulateInfo?.gasPrice || "5000000000",
        payer: ACCOUNT_ADDRESS,
        granter: "",
        privateKey: ACCOUNT_PRIVATEKEY,
      });
    }
  } catch (err) {
    // console.error("Error: ", repoPath, err);
    // Do nothing
  }

  try {
    //   const fileName = repoPath.split("/").pop();
    // let contentType = "";
    const fileBuffer = fs.readFileSync(filePath);
    const contentType = mimeTypes.lookup(path.extname(filePath));
    const expectCheckSums = rs.encode(Uint8Array.from(fileBuffer));

    const createPostTx = await client.object.createObject({
      bucketName: "gnfd-press-" + BUCKET_NAME,
      objectName: repoPath,
      creator: ACCOUNT_ADDRESS,
      visibility: VisibilityType.VISIBILITY_TYPE_PUBLIC_READ,
      contentType: contentType,
      redundancyType: RedundancyType.REDUNDANCY_EC_TYPE,
      payloadSize: Long.fromInt(fileBuffer.byteLength),
      expectChecksums: expectCheckSums.map((x) => bytesFromBase64(x)),
    });

    const simulateInfo = await createPostTx.simulate({
      denom: "BNB",
    });

    const res = await createPostTx.broadcast({
      denom: "BNB",
      gasLimit: Number(simulateInfo?.gasLimit),
      gasPrice: simulateInfo?.gasPrice || "5000000000",
      payer: ACCOUNT_ADDRESS,
      granter: "",
      privateKey: ACCOUNT_PRIVATEKEY,
    });

    if (res.code === 0) {
      const uploadRes = await client.object.uploadObject(
        {
          bucketName: "gnfd-press-" + BUCKET_NAME,
          objectName: repoPath,
          body: createFile(filePath),
          txnHash: res.transactionHash,
          duration: 20000,
        },
        {
          type: "ECDSA",
          privateKey: ACCOUNT_PRIVATEKEY,
        }
      );
      console.log("uploadRes", repoPath, uploadRes);

      if (uploadRes.code === 0) {
        console.log("Upload Success");
      } else {
        console.error("Upload failed", uploadRes);
      }
    } else {
      console.error("Unable to create object ", repoPath, res);
    }
  } catch (error) {
    console.log("ERROR", error);
  }
}
async function listFilesAndUpload(directory, parentPath = "") {
  //   fs.readdir(directory, async (err, files) => {
  // if (err) {
  //   return console.error(`Error reading directory: ${err.message}`);
  // }
  console.log("listing files");
  await createBucketIfNotPresent();
  const files = fs.readdirSync(directory);

  // files.forEach((file) => {
  await files.reduce(async (promise, file) => {
    await promise;
    const fullPath = path.join(directory, file);
    const repoPath = path.join(parentPath, file).replace(/\\/g, "/"); // Normalize path for GitHub

    // fs.stat(fullPath, async (err, stats) => {

    const stats = fs.statSync(fullPath);
    // if (err) {
    //   return console.error(`Error getting stats for file: ${err.message}`);
    // }
    if (stats.isDirectory()) {
      await listFilesAndUpload(fullPath, repoPath); // Recursively handle directories
    } else {
      await uploadFileGreenfield(fullPath, repoPath); // Upload file
    }
  }, Promise.resolve());
}

// Replace with the path to the directory you want to upload
const directoryPath = "./out";

(async () => {
  await listFilesAndUpload(directoryPath);
})();
// uploadToGreenfield("./out", "");
