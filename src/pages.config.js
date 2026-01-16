import Activity from './pages/Activity';
import Admin from './pages/Admin';
import Favorites from './pages/Favorites';
import Home from './pages/Home';
import Neighborhoods from './pages/Neighborhoods';
import Portfolio from './pages/Portfolio';
import Settings from './pages/Settings';
import Subscription from './pages/Subscription';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Activity": Activity,
    "Admin": Admin,
    "Favorites": Favorites,
    "Home": Home,
    "Neighborhoods": Neighborhoods,
    "Portfolio": Portfolio,
    "Settings": Settings,
    "Subscription": Subscription,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};