import Home from './pages/Home';
import Subscription from './pages/Subscription';
import Settings from './pages/Settings';
import Activity from './pages/Activity';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Subscription": Subscription,
    "Settings": Settings,
    "Activity": Activity,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};