require("dotenv").config();

import { client } from "@/components/client";
import Layout from "@/components/layout/Layout";
import {
  listGreenfieldObjects,
  listGreenfieldObjectsById,
} from "@/components/util";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const edjsHTML = require("editorjs-html");

const { ACCOUNT_ADDRESS, ACCOUNT_PRIVATEKEY } = process.env;

export default function Page({ post }) {
  console.log("Post", post);
  const edjsParser = edjsHTML();
  const html = edjsParser.parse(post.data);
  console.log(html);
  return (
    <>
      <Layout>
        <div
          id="content"
          className={`flex min-h-screen flex-col items-center justify-between p-16 w-full max-w-3xl mx-auto items-center ${inter.className}`}
        >
          <h1>
            Harnessing BNB Greenfield for Web Hosting: A New Era of
            Decentralized Storage
          </h1>

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
      bucketName: "helllo-world-test-xeo",
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
  }

  // Pass post data to the page via props
  //   return { props: { post } };
}
