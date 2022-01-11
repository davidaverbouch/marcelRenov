# Marcel rénovation app

Ce projet est encore en cours de réalisation, cela fait 1,5 mois que je le developpe seul.

Ce projet contient 3 applications web :
- Appli des gestionnaires
- Appli des techniciens
- Appli de la direction

Ce projet a pour objectif de fournir au technicien un calendrier des interventions qu'ils ont a réaliser le jour même et le lendemain.

L'application de direction permet d'ajouter des employés (gestionnaires ou techniciens) ainsi que des partenaires (ici des syndics).

Pour cela, les gestionnaires peuvent ajouter au calendrier de chaque technicien des interventions en fonction du syndic lié a l'intervention.

Les techniciens peuvent répondre favorablement ou defavorablement en fonction du résultat de leur intervention (photo a l'appui)

Pour chacune des 3 applications, il vous suffit d'ouvrir un terminal dans le dossier, puis lancer ou compiler l'application react :
- npm start => lancer l'application en locale
- npm run build => compiler l'application 
pour compiler, utiliser un terminal bash car il y a un deplacement (rm et cp vers le dossier public et windows ne reconnait pas ces commandes)

## Gestionnaires

Cette application se trouve dans le dossier gestionnaire;

![image](https://github.com/davidaverbouch/marcelRenov/blob/master/gestionnaire1.png)
![image](https://github.com/davidaverbouch/marcelRenov/blob/master/gestionnaire2.png)
![image](https://github.com/davidaverbouch/marcelRenov/blob/master/gestionnaire3.png)
![image](https://github.com/davidaverbouch/marcelRenov/blob/master/gestionnaire4.png)
![image](https://github.com/davidaverbouch/marcelRenov/blob/master/gestionnaire5.png)

## Techniciens

Cette application se trouve dans le dossier technicien;

![image](https://github.com/davidaverbouch/marcelRenov/blob/master/technicien1.png)
![image](https://github.com/davidaverbouch/marcelRenov/blob/master/technicien2.png)
![image](https://github.com/davidaverbouch/marcelRenov/blob/master/technicien3.png)

## Direction

Cette application se trouve dans le dossier direction;

interface non responsive (a revoir), il y a de grands tableaux d'utilisateur avec la possibilité d en ajouter
Revoir cette interface sous forme de carte plutot que de ligne dans un tableau