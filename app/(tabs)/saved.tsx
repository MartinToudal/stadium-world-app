import { StadiumBrowser } from "../../components/stadium-browser";

export default function SavedScreen() {
  return (
    <StadiumBrowser
      defaultCollectionFilter="all"
      heroTitle="Byg din egen stadionhistorik med besøg, datoer og fremtidige mål."
      heroText="Det vigtigste lige nu er overblik: hvilke stadioner du har været på, hvornår du var der, og hvilke der stadig står på listen."
      panelTitle="Dine samlinger"
      showCollectionFilters
      showTripPlanner
    />
  );
}
