Die Aktion wartet auf eine Antwort von einer Resource (URL). Sie kann beispielsweise verwendet werden, um auf den Start eines Backends oder eines Frontends nach einem deployment zu warten um anschließend einen Smoke-Test mit z. B. Bruno oder Postman durchzuführen.

Da nach einem Deployment der Start der Ressourcen etwas dauert und je nach
Umgebung durchaus einige Minuten betragen kann, ist es sinnvoll, den Start der
Ressource aktiv zu verfolgen und dann die Pipeline mit den nächsten Schritten
fortzuführen. Diese Action hilft dabei.

Wait-For-Response-Action kann die Ressource überwachen und liefert ein Ergebnis
(result: OK) wenn die Ressource mit dem gewünschten HTTP-Status (z. B.
http-status: 200) erreichbar war. Das muss innerhalb einer bestimmten Zeitspanne
geschehen (z. B. timeout: 60000). Die einzelne Abfrage kann unterbrochen werden
(z. B. single-fetch-timeout: 2000), um anschließend nach einer Wartezeit (z. B.
waiting-time: 1000) den nächsten Versuch zu unternehmen.

Wenn innerhalb der Zeitspanne (z. B. timeout: 60000) der gewünschte HTTP-Status
(z. B. http-status: 200) nicht erreicht wurde, bricht die Action die Pipeline
auf Wunsch ab (stop-on-timeout: true) oder führt die Verarbeitung weiter fort
(stop-on-timeout: false).
