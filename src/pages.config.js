import Activity from './pages/Activity';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Subscription from './pages/Subscription';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Activity": Activity,
    "Home": Home,
    "Settings": Settings,
    "Subscription": Subscription,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};