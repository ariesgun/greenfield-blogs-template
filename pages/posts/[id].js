require("dotenv").config();

import { client } from "@/components/client";
import Layout from "@/components/layout/Layout";
import {
  listGreenfieldObjects,
  listGreenfieldObjectsById,
} from "@/components/util";
import moment from "moment";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const edjsHTML = require("editorjs-html");

const { ACCOUNT_ADDRESS, ACCOUNT_PRIVATEKEY, BUCKET_NAME } = process.env;

export default function Page({ post }) {
  console.log("Post", post);
  const edjsParser = edjsHTML();
  const html = edjsParser.parse(post.data.payload);
  console.log("Parsed HTML", html);

  return (
    <>
      <Layout>
        <div
          id="content"
          className={`flex min-h-screen flex-col items-center p-16 w-full max-w-4xl mx-auto items-center ${inter.className}`}
        >
          <h1>{post.data.title}</h1>

          <div className="flex flex-row gap-x-2 my-4">
            <svg
              className="h-6 w-6 flex-shrink-0 text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                clip-rule="evenodd"
              />
            </svg>
            <div className="text-gray-500">
              {moment(post.data.payload.time).format("D MMM, YYYY")}
            </div>
          </div>

          <div className="z-10 items-center justify-between text-base">
            {html.length > 0 &&
              html.map((ele_html, idx) => (
                <div
                  className=""
                  key={idx}
                  dangerouslySetInnerHTML={{ __html: ele_html }}
                ></div>
              ))}
          </div>
        </div>
      </Layout>
    </>
  );
}

export async function getStaticPaths() {
  // Call an external API endpoint to get posts
  //   const res = await fetch("https://.../posts");
  let objects = [];
  try {
    objects = await listGreenfieldObjects({
      bucketName: BUCKET_NAME,
    });
  } catch (e) {
    console.log("Fail to list objects: ", e);
  }

  // Get the paths we want to pre-render based on posts
  const paths = objects.map((post) => ({
    params: { id: post.ObjectInfo.Id.toString() },
  }));

  // We'll pre-render only these paths at build time.
  // { fallback: false } means other routes should 404.
  return { paths, fallback: false };
}

// This also gets called at build time
export async function getStaticProps({ params }) {
  // params contains the post `id`.
  // If the route is like /posts/1, then params.id is 1
  //   const res = await fetch(`https://.../posts/${params.id}`);
  let objectInfo;
  try {
    objectInfo = await listGreenfieldObjectsById({ params });
    console.log("Object ", objectInfo);

    const downloadFileTx = await client.object.getObject(
      {
        bucketName: objectInfo.BucketName,
        objectName: objectInfo.ObjectName,
      },
      {
        type: "ECDSA",
        privateKey: ACCOUNT_PRIVATEKEY,
      }
    );

    console.log("Download", downloadFileTx);
    const payload = JSON.parse(await downloadFileTx.body.text());

    // const json = await response.json();
    console.log("JSON", payload);
    return { props: { post: { id: params.id, data: payload } } };
  } catch (e) {
    console.log("Fail to list objects by id: ", e);
    throw e;
  }

  // Pass post data to the page via props
  //   return { props: { post } };
}
