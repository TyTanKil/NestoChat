Commande à faire : \
\
A la racine du projet : \
\
npm install \
npx prisma generate \
npx prisma db push \
npm run start:dev \
\
Puis après cd chat-vue : \
\
npm install \
npm run serve \
\
Lorsque l'application est lancée, elle est accessible via l'url : localhost:8080/ 
\
On peut ensuite se connecter ou s'enregistrer (des pop-up s'affichent pour valider une action ou afficher s'il y'a une erreur)
\
L'authentification fonctionne via un système de TokenJWT et les users sont enregistrés dans une base Prisma \
\
Le token étant persistant tant que l'application tourne, il est donc possible de se connecter avec deux utilisateurs maximum par navigateur (un user + un autre dans une fenêtre de navigation privée) \
Si besoin, il est toujours possible d'utiliser plusieurs navigateurs différents afin de contourner cette règle \
Enfin, même si l'on coupe le back et qu'on le relance, à moins de modifier à nouveau la DB prisma, les user crées restent disponibles ! \
\
A savoir : En cas de problèmes potentiels liés à des dépendances ne pas hésiter à utiliser les commandes liées à ces dernières : \
\
npm install @prisma/client prisma \
npm install bcryptjs @nestjs/jwt @nestjs/passport passport passport-jwt \

Enjoy :)
