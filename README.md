# 🏡 Sirchhausen – das Familie-Sirch-Spiel

Spiel-, Beschäftigungs- und Bewegungs-App für Malia (4) und Nele (3).
Läuft als Web-App auf iPhone und iPad (Querformat), auch offline.

Das ganze Konzept steht in [`docs/KONZEPT.md`](docs/KONZEPT.md).

## Stand: Etappe 1 – Fundament
- **Wer spielt heute?** Kinder-Auswahl für Malia & Nele
- **Figuren-Editor** mit Spiegel: Haut, Frisur, Haarfarbe, Augen, Oberteil, Hose/Rock, Schuhe, Schmuck & Extras (Krone, Feenflügel, Schleife …)
- **19 Kuscheltiere**, u. a. Tukan, Bär, Wildschwein, Affe, Pavian, Rassel, Gelbi, Puppi, Einhorn, Allgäuer Kuh
- **Dorf Sirchhausen** mit eurem Haus, Mama & Papa, Bailey, Schildkröte, beiden Großelternpaaren, Kühen und Allgäuer Bergen. Fast alles reagiert auf Antippen.
- **Bewegungspausen**: Gerät ablegen (Bewegungssensor), Tanz-, Tier-, Sport- und Suchaufgaben, Stopptanz, Mitzählen, Sterne
- **Tageslimit** mit Schlaf-Bildschirm
- **Sternenglas** mit echten Belohnungen
- **Elternbereich** (Schloss 1,5 s gedrückt halten + PIN)
- Selbst komponierte Musik und Geräusche, deutsche Sprachausgabe

## Etappe 2 – Erste Spiele
- **Haus von innen** (Puppenhaus-Ansicht): Kinderzimmer, Bad, Wohnzimmer, Küche
- **Tamagotchi** im Kinderzimmer: füttern (mit Lieblingsessen), baden mit Schwamm & Dusche, Zähne putzen, schlafen legen, Ball spielen, anziehen (Hüte, Brillen, Schals), kuscheln. Bedürfnisse sinken mit der echten Zeit.
- **Memory** am Terrassentisch: Kuscheltiere, Familie oder eigene Fotos, allein oder zu zweit (mit Schwester, Mama oder Papa)
- **Malen** an der Staffelei: 6 Ausmalbilder (Bailey, unser Haus, Allgäuer Kuh, Einhorn, Schmetterling, Fisch) oder freies Malen, Regenbogen-Pinsel, Stempel, Galerie
- **Zähneputzen-Monster** im Bad: 4 Monster, Schmutz & Bakterien wegputzen, ausspülen
- **Musik & Tanzen** im Wohnzimmer: Xylophon, Schlagzeug mit Kuhglocke, Tierorchester, Lieder lernen (Alle meine Entchen, Hänschen klein, Sirchhausen-Lied), Tanz-Party
- Alle Spiele: leicht/schwer selbst wählen, Schwierigkeit steigt mit jedem Erfolg, Sterne als Belohnung
- Elternbereich: Fotos für Memory hochladen, gemalte Bilder verwalten

## Etappe 3 – Mehr Spiele
- **Dachboden** im Haus: Ankleide und Spielzimmer
- **Backen & Kochen** in der Küche: Plätzchen (Zutaten, Rühren, Ausrollen, Ausstechen, Ofen, Verzieren), Pizza (Soße, Käse, Beläge, Ofen), Kuchen (Teig, Ofen, Sahne, Früchte, Kerzen auspusten). Zum Schluss probiert das Kuscheltier.
- **Puzzle**: Dorf, Haus, Familie, Kuscheltiere oder eigene Fotos – von 4 bis 20 Teilen
- **Suchbilder „Wo ist Bailey?“** (Zypressen im Garten): Bailey und versteckte Dinge im Dorf oder im Haus finden, mit Tipp-Lupe
- **Sortieren & Zählen** (Spielzimmer): Zählen mit Mitzählen, Farben in Körbe sortieren, Größen vergleichen, Formen einstecken
- **Kleiderschrank** (Ankleide): Alle Familienmitglieder anziehen, Kostüme (Dirndl, Tracht mit Lederhose, Prinzessin, Fee, Pirat, Feuerwehr, Schlafanzug), Foto-Knopf, und das **Wetter-Spiel** (Sonne, Regen, Schnee – richtig anziehen!)

## Lokal starten
```bash
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```
Keine Installation, kein Build-Schritt. `dev/gallery.html` zeigt alle Figuren und Kuscheltiere.

## Auf dem iPad/iPhone
Über HTTPS öffnen (z. B. GitHub Pages) → Teilen → „Zum Home-Bildschirm“.
Bei neuen Versionen in `sw.js` die `VERSION` erhöhen.
