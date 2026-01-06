import Activity from './pages/Activity';
import Admin from './pages/Admin';
import Favorites from './pages/Favorites';
import Neighborhoods from './pages/Neighborhoods';
import Portfolio from './pages/Portfolio';
import Settings from './pages/Settings';
import Subscription from './pages/Subscription';
import Home from './pages/Home';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Activity": Activity,
    "Admin": Admin,
    "Favorites": Favorites,
    "Neighborhoods": Neighborhoods,
    "Portfolio": Portfolio,
    "Settings": Settings,
    "Subscription": Subscription,
    "Home": Home,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};