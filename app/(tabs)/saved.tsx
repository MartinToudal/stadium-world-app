import { StadiumBrowser } from "../../components/stadium-browser";

export default function SavedScreen() {
  return (
    <StadiumBrowser
      defaultCollectionFilter="all"
      heroTitle="Byg din egen stadiontracker med favoritter, besøg og wishlist."
      heroText="Din personlige stadionhistorik ligger lokalt på enheden og kan senere deles direkte med en rigtig iOS-app med samme state-lag."
      panelTitle="Dine samlinger"
      showCollectionFilters
      showTripPlanner
    />
  );
}
