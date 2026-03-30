import { StadiumBrowser } from "../../components/stadium-browser";

export default function SavedScreen() {
  return (
    <StadiumBrowser
      defaultCollectionFilter="all"
      heroTitle="Hold styr på din egen stadionrejse."
      heroText="Saml dine besøg, gem datoerne og få et klart overblik over hvilke stadioner der allerede er en del af din historie."
      panelTitle="My Tour Directory"
      showCollectionFilters
      showTripPlanner
    />
  );
}
