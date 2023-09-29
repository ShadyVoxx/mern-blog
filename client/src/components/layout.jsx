import {Outlet} from "react-router-dom";
import Header from "./header.jsx";

const Layout = () =>{
    return (
        <main>
            <Header />
            <Outlet />
        </main>
    )
}

export default Layout;