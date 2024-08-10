require("dotenv").config();

import Image from "next/image";
import { Inter } from "next/font/google";
import Layout from "@/components/layout/Layout";
import BlogCard from "@/components/blog/BlogCard";
import { listGreenfieldObjects } from "@/components/util";

import { client } from "@/components/client";

const { ACCOUNT_ADDRESS, ACCOUNT_PRIVATEKEY } = process.env;

const inter = Inter({ subsets: ["latin"] });

export default function Home({ posts }) {
  return (
    <Layout>
      <div
        className={`flex min-h-screen flex-col items-center justify-between px-24 w-full max-w-screen-2xl mx-auto items-center ${inter.className}`}
      >
        <div className="mx-auto mt-4 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 pt-8 sm:mt-8 sm:pt-10 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {posts.length > 0 &&
            posts.map((post, idx) => (
              <BlogCard
                key={idx}
                title={"Title 1"}
                description={post.blocks[0].data.text}
                datePost={post.time}
              />
            ))}
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  let objects = [];
  let paths = [];
  try {
    objects = await listGreenfieldObjects({
      bucketName: "helllo-world-test-xeo",
    });
  } catch (e) {
    console.log("Fail to list objects: ", e);
  }

  console.log("obj", objects);

  // Get the paths we want to pre-render based on posts
  paths = await Promise.all(
    objects.map(async (post) => {
      const objectInfo = post.ObjectInfo;
      console.log("AA", objectInfo);

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
      console.log("JSON", payload.blocks[0].data);

      return payload;
    })
  );

  console.log("Paths", paths);

  return { props: { posts: paths } };
}
