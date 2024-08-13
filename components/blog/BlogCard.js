import moment from "moment";
import Image from "next/image";
import Link from "next/link";

const BlogCard = ({ title, description, postId, datePost }) => {
  return (
    <article className="overflow-hidden rounded-lg shadow transition hover:shadow-lg">
      <Image
        alt=""
        src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-1.2.1&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
        className="h-56 w-full object-cover"
      />

      <div className="bg-white p-4 sm:p-6">
        <div className="block text-xs text-gray-500">
          {moment(datePost).format("Do MMM YYYY")}
        </div>

        <Link href={"/posts/" + postId}>
          <h3 className="mt-0.5 text-lg text-gray-900">{title}</h3>
        </Link>

        <p className="mt-2 line-clamp-3 text-sm/relaxed text-gray-500">
          {description}
        </p>
      </div>
    </article>
  );
};

export default BlogCard;
