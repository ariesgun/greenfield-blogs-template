import Footer from "./Footer";
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <>
      <div className="flex flex-col h-screen justify-between">
        <Header />
        <main className="my-4">{children}</main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
