# Marcel rénovation app

Ce projet est encore en cours de réalisation, cela fait 1,5 mois que je le developpe seul.
Il est developpé en react avec le template redux, il est connecté à firebase (cloud de google)

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

Cette application se trouve dans le dossier gestionnaire:

Apres s'etre connecté :
![image](https://github.com/davidaverbouch/marcelRenov/blob/master/gestionnaire1.png)

Detail en cliquant sur une intervention
![image](https://github.com/davidaverbouch/marcelRenov/blob/master/gestionnaire2.png)

Rechercher une intervention
![image](https://github.com/davidaverbouch/marcelRenov/blob/master/gestionnaire3.png)

Changer de partenaire (syndics)
![image](https://github.com/davidaverbouch/marcelRenov/blob/master/gestionnaire4.png)

Vu Mobile
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


## Reste a faire :

    - rendre l'appli de la direction responsive
    - permettre une utilisation en mode hors ligne
    - mettre en place les tests (jest et cypress), par manque de temps, je n'ai pas ENCORE mis de test en place
    - ajouter un bouton favori au gestionnaire pour facilement retrouver une intervention qu'on sait devoir revoir
    - ajouter des notifications sur chacune des 3 applications
    - envoi de sms automatique en cas de retard au prochain rdv (technicien)
    - faire un dictionnaire de mots clé pour simplifier l'ajout de nouvelle intervention (redondance des titres et taches)
    - générer un document en sortie (facture)