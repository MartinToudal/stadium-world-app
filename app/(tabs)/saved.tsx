import { StadiumBrowser } from "../../components/stadium-browser";

export default function SavedScreen() {
  return (
    <StadiumBrowser
      defaultFavoritesOnly
      heroTitle="Byg din egen globale stadionliste."
      heroText="Favoritter ligger lokalt på enheden og kan senere genbruges direkte i en rigtig iOS-app med samme state-lag."
      panelTitle="Dine favoritter"
    />
  );
}
