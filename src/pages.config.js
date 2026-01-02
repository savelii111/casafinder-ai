import Activity from './pages/Activity';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Subscription from './pages/Subscription';
import Favorites from './pages/Favorites';
import Portfolio from './pages/Portfolio';
import Admin from './pages/Admin';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Activity": Activity,
    "Home": Home,
    "Settings": Settings,
    "Subscription": Subscription,
    "Favorites": Favorites,
    "Portfolio": Portfolio,
    "Admin": Admin,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};