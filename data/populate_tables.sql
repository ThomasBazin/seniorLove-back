-- Insert sample data into administrators
INSERT INTO administrators (name, email, password, created_at, updated_at) VALUES
('admin', 'admin@seniorlove.com', 'adminpass123', NOW(), NOW()),


-- Insert sample data into events
INSERT INTO events (name, location, description, picture, date, time, admin_id, created_at, updated_at) VALUES
('Cours de cuisine', 'Paris', $$"Rejoignez-nous pour une expérience culinaire inoubliable au cœur de Paris ! Notre événement de cours de cuisine vous invite à découvrir les secrets de la gastronomie française dans un cadre élégant et convivial. Sous la direction de chefs talentueux et passionnés, vous apprendrez à préparer des plats emblématiques tels que le coq au vin, les macarons ou encore les éclairs au chocolat. Que vous soyez débutant ou amateur averti, ce cours vous permettra d'affiner vos compétences tout en partageant un moment chaleureux avec d'autres passionnés de cuisine. Profitez également de notre sélection de vins pour accompagner vos créations et d'une ambiance parisienne authentique. Réservez dès maintenant et plongez dans l’art culinaire à Paris !"$$, 'tech_conference.jpg', '2024-12-01', '10:00:00', 1, NOW(), NOW()),
('Apéro céramique', 'Lyon', $$"Venez explorer votre créativité au cœur de Lyon lors de notre atelier de céramique ! Pour une journée, plongez dans l’univers fascinant de la poterie et du modelage sous l'œil expert de céramistes passionnés. Le matin, découvrez les techniques de base pour façonner et sculpter l’argile, en créant des pièces uniques telles que des bols et des vases. Après une pause déjeuner gourmande, poursuivez avec un atelier sur la décoration et l'émaillage, où vous apprendrez à appliquer des motifs et des couleurs vibrantes à vos créations. À la fin de la journée, repartez avec vos œuvres, prêtes à être cuites et exposées. Que vous soyez novice ou amateur confirmé, cet atelier vous offre une occasion idéale pour exprimer votre créativité tout en profitant de l'atmosphère chaleureuse et inspirante de Lyon. Réservez votre place pour une journée artistique et enrichissante !"$$, 'tech_conference.jpg', '2024-12-03', '17:30:00', 1, NOW(), NOW()),
('Atelier mixologie', 'Marseille', $$"Venez vivre une soirée pétillante et raffinée à Marseille lors de notre atelier de mixologie ! Plongez dans l’art de la création de cocktails sous la houlette de barmen experts, qui vous guideront à travers les techniques essentielles et les secrets des mélanges audacieux. L’atelier commence par une introduction aux bases de la mixologie, suivie de la préparation de cocktails emblématiques et innovants, tels que le Mojito revisité ou le Negroni parfait. Après une pause pour déguster vos créations accompagnées de tapas gourmet, vous explorerez des astuces de présentation et des combinaisons de saveurs originales. Que vous soyez un amateur de cocktails ou un passionné en quête de nouvelles compétences, cet événement promet une expérience ludique et instructive dans un cadre chic et convivial. Réservez votre place dès maintenant pour une soirée savoureuse et animée au cœur de Marseille !"$$, '2024-12-20', '18:00:00', 1, NOW(), NOW()),
('Dégustation de vins', 'Bordeaux', $$"Venez découvrir l’élégance des grands crus lors de notre événement de dégustation de vin à Bordeaux ! Ce rendez-vous incontournable vous plonge dans l’univers fascinant des vignobles bordelais. La journée commence par un accueil chaleureux avec un verre de vin pétillant, suivi d'une présentation captivante des cépages emblématiques de la région. Sous la conduite d’experts œnologues, vous apprendrez à déguster et à apprécier les subtilités des grands Bordeaux, des rouges puissants aux blancs raffinés. Chaque session est accompagnée de bouchées gastronomiques préparées pour sublimer les accords mets-vins. En fin de journée, vous aurez l’opportunité de discuter avec les producteurs locaux et de découvrir leurs secrets de vinification. Que vous soyez novice ou connaisseur, cet événement promet une immersion sensorielle enrichissante au cœur de la capitale du vin. Réservez dès maintenant pour vivre une expérience inoubliable dans l'une des plus célèbres régions viticoles du monde !"$$, '2024-12-15', '11:30:00', 1, NOW(), NOW()),
('Speed dating', 'Nice', $$"Venez vivre une soirée conviviale et pleine de rencontres à Nice lors de notre événement de speed dating spécialement conçu pour les personnes âgées ! Dans un cadre élégant et chaleureux, cet événement vous offre une opportunité unique de faire de nouvelles connaissances et de partager des moments précieux avec des personnes ayant des intérêts et des expériences de vie similaires. Chaque participant aura la chance de discuter brièvement avec plusieurs personnes au cours de sessions de 5 à 7 minutes, permettant ainsi de découvrir de nouvelles affinités et de nouer des liens significatifs. Après les rencontres, profitez d’un moment de détente autour d’un verre et de douceurs, pour échanger librement et prolonger les conversations. Que vous cherchiez une nouvelle amitié ou une connexion plus personnelle, cette soirée est l'occasion parfaite de redécouvrir les plaisirs de la rencontre dans une ambiance détendue et respectueuse. Réservez votre place pour une expérience enrichissante au cœur de Nice !"$$, '2024-12-03', '19:00:00', 1, NOW(), NOW()),
('Atelier jardinage', 'Toulouse', $$"Rejoignez-nous pour une journée verdoyante et enrichissante lors de notre atelier de jardinage à Toulouse ! Cet événement vous plonge dans l’art de cultiver un jardin florissant, que vous soyez novice ou passionné. La matinée débute par une introduction aux techniques de base du jardinage, incluant la préparation du sol, la sélection des plantes adaptées et les secrets pour une croissance optimale. Après une pause gourmande, passez à la pratique en créant vos propres pots de fleurs ou jardinières, tout en apprenant les astuces pour entretenir vos plantations. Nos experts vous guideront également sur la gestion des ressources naturelles et des outils de jardinage. En fin de journée, repartez avec vos créations et des conseils personnalisés pour continuer à développer votre jardin chez vous. Profitez de cette occasion pour partager votre passion avec d’autres amoureux de la nature dans un cadre convivial et inspirant. Réservez dès maintenant pour une immersion totale dans le monde du jardinage à Toulouse !"$$, '2024-12-12', '08:30:00', 1, NOW(), NOW()),
('Cours de photographie', 'Strasbourg', $$"Participez à notre événement captivant de cours de photographie à Strasbourg et découvrez les secrets pour capturer des images éblouissantes ! Cette journée immersive commence par une introduction aux techniques fondamentales de la photographie, de la composition à l’éclairage, animée par des professionnels expérimentés. Ensuite, mettez en pratique vos nouvelles compétences lors d’une session de prise de vue dans les charmantes rues et paysages strasbourgeois. Après une pause déjeuner, plongez dans les astuces de retouche photo avec des logiciels spécialisés pour sublimer vos clichés. Vous aurez également l’opportunité de partager vos photos avec les autres participants et de recevoir des critiques constructives. Que vous soyez débutant ou photographe amateur, cet atelier vous offre une chance unique d’améliorer votre art tout en explorant la beauté de Strasbourg. Réservez dès maintenant pour capturer des souvenirs inoubliables et perfectionner votre technique !"$$, '2024-12-06', '09:30:00', 1, NOW(), NOW()),
('Soirée jazz', 'Nantes', $$"Plongez dans une soirée envoûtante de jazz à Nantes et laissez-vous emporter par des mélodies enivrantes ! Cet événement exceptionnel vous invite à découvrir le meilleur du jazz dans une ambiance élégante et intimiste. La soirée commence avec un accueil chaleureux, suivi d'une performance en direct d'artistes de jazz de renom qui vous séduiront avec des improvisations captivantes et des standards intemporels. Profitez d’une sélection raffinée de cocktails et de tapas gourmet tout en vous imprégnant des rythmes entraînants et des harmonies sophistiquées. Laissez-vous bercer par les sonorités du saxophone, du piano et de la batterie dans un cadre convivial où la musique crée des moments magiques. Que vous soyez un amateur de jazz ou simplement en quête d'une soirée mémorable, cet événement promet une expérience sensorielle inoubliable au cœur de Nantes. Réservez dès maintenant pour une nuit de jazz élégante et inspirante !"$$, '2024-12-10', '20:00:00', 1, NOW(), NOW()),
('Club de lecture', 'En ligne', $$"Rejoignez notre club de lecture en ligne pour une expérience littéraire enrichissante et interactive ! Chaque mois, nous plongeons ensemble dans un livre captivant, choisi pour sa richesse et sa pertinence. Lors de nos rencontres virtuelles, animées par un modérateur passionné, nous échangeons nos impressions, analyses et découvertes autour du roman, essai ou nouvelle sélectionné. Ce club offre un espace convivial et stimulant pour partager vos réflexions et écouter celles des autres participants, tout en approfondissant votre compréhension des œuvres lues. Profitez également de recommandations personnalisées et de discussions animées sur des thèmes variés, allant de la fiction contemporaine aux classiques littéraires. Que vous soyez un lecteur assidu ou occasionnel, cet événement est l'occasion parfaite pour explorer de nouveaux horizons littéraires et tisser des liens avec d'autres passionnés. Réservez votre place pour une aventure littéraire inoubliable !"$$, '2024-12-02', '18:00:00', 1, NOW(), NOW()),
('Cours de chorale', 'Avignon', $$"Rejoignez-nous pour une journée musicale inoubliable lors de notre cours de chorale à Avignon ! Que vous soyez un chanteur débutant ou expérimenté, cet événement est l’occasion idéale de découvrir les plaisirs du chant choral dans un cadre inspirant. Sous la direction d’un chef de chœur passionné, vous apprendrez à interpréter des morceaux variés, allant des classiques intemporels aux chansons modernes. Le matin, vous participerez à des échauffements vocaux et des techniques de respiration, avant de plonger dans la pratique en groupe. Après une pause déjeuner conviviale, continuez à perfectionner votre voix et votre harmonie avec des exercices dynamiques. En fin de journée, partagez le fruit de votre travail avec une performance en petit groupe, mettant en valeur les progrès réalisés. Venez vivre une expérience enrichissante et harmonieuse au cœur d’Avignon, où musique et convivialité se rencontrent !"$$, '2024-12-23', '16:00:00', 1, NOW(), NOW()),
('Soirée méditation', 'Rennes', $$"Offrez-vous une soirée de sérénité et de bien-être lors de notre soirée méditation à Rennes ! Dans un cadre apaisant et élégant, plongez dans l’univers de la pleine conscience et du calme intérieur. La soirée commence par une introduction douce aux principes de la méditation, suivie de séances guidées adaptées à tous les niveaux. Nos instructeurs expérimentés vous guideront à travers des pratiques de méditation variées, allant de la relaxation profonde à la pleine conscience, pour vous aider à libérer le stress et retrouver votre équilibre. Après une pause revitalisante avec des infusions et des en-cas sains, poursuivez avec une méditation en groupe, favorisant un sentiment de connexion et de paix intérieure. Que vous soyez novice ou méditant régulier, cette soirée vous offrira une pause bien méritée dans la routine quotidienne. Réservez dès maintenant pour une expérience de méditation apaisante et revitalisante au cœur de Rennes !"$$, '2024-12-19', '21:00:00', 1, NOW(), NOW()),
('Balade en montgolfière', 'Saumur', $$"Vivez une aventure inoubliable avec notre balade en montgolfière au-dessus de Saumur ! Offrez-vous une vue panoramique spectaculaire sur les paysages enchâssés de la vallée de la Loire et les châteaux majestueux qui ornent la région. À l'aube, vous serez accueilli avec un petit-déjeuner léger avant de participer à la préparation de la montgolfière, où vous découvrirez le processus fascinant de gonflage. Une fois dans les airs, laissez-vous emporter par la douce montée et admirez les panoramas époustouflants qui se dévoilent sous vos yeux. Votre pilote expérimenté partagera des anecdotes locales et vous guidera tout au long de cette expérience magique. À la fin du vol, célébrez votre aventure avec un toast traditionnel et un certificat souvenir. Réservez dès maintenant pour un voyage aérien mémorable qui allie sérénité et émerveillement au cœur de Saumur !"$$, '2024-12-07', '10:30:00', 1, NOW(), NOW()),

-- Insert sample data into hobbies
INSERT INTO hobbies (name, created_at, updated_at) VALUES
('Voyages et découvertes', NOW(), NOW()),
('Art et culture', NOW(), NOW()),
('Sport et bien-être', NOW(), NOW()),
('Gastronomie et cuisine', NOW(), NOW()),
('Musique et danse', NOW(), NOW()),
('Bénévolat et engagement social', NOW(), NOW()),
('Jeux et divertissement', NOW(), NOW()),
('Technologies et innovations', NOW(), NOW()),
('Spiritualité et bien-être intérieur', NOW(), NOW()),
('Bricolage et loisirs créatifs', NOW(), NOW()),
('Animaux et nature', NOW(), NOW()),
('Histoire et patrimoine', NOW(), NOW());

-- Insert sample data into users_messages
INSERT INTO users_messages (message, sender_id, receiver_id, created_at, updated_at) VALUES
('Hey Alice, are you coming to the tech conference?', 2, 1, NOW(), NOW()),
('Hi Bob, just wanted to say thank you for the book recommendation!', 1, 2, NOW(), NOW()),
('Charlie, did you get the files I sent?', 3, 1, NOW(), NOW()),
('Diana, can you help me with the workout plan?', 4, 1, NOW(), NOW()),
('Edward, how was the music festival?', 5, 1, NOW(), NOW());

-- Insert sample data into users_events
INSERT INTO users_events (user_id, event_id, created_at, updated_at) VALUES
(1, 1, NOW(), NOW()),
(2, 2, NOW(), NOW()),
(3, 3, NOW(), NOW()),
(4, 4, NOW(), NOW()),
(5, 5, NOW(), NOW());

-- Insert sample data into users_hobbies
INSERT INTO users_hobbies (user_id, hobbie_id, created_at, updated_at) VALUES
(1, 1, NOW(), NOW()),
(1, 7, NOW(), NOW()),
(1, 4, NOW(), NOW()),
(2, 1, NOW(), NOW()),
(2, 12, NOW(), NOW()),
(2, 10, NOW(), NOW()),
(2, 7, NOW(), NOW()),
(3, 2, NOW(), NOW()),
(3, 3, NOW(), NOW()),
(3, 11, NOW(), NOW()),
(3, 4, NOW(), NOW()),
(3, 6, NOW(), NOW()),
(4, 3, NOW(), NOW()),
(4, 6, NOW(), NOW()),
(4, 9, NOW(), NOW()),
(5, 8, NOW(), NOW()),
(6, 1, NOW(), NOW()),
(6, 2, NOW(), NOW()),
(6, 3, NOW(), NOW()),
(6, 4, NOW(), NOW()),
(6, 5, NOW(), NOW()),
(7, 5, NOW(), NOW()),
(7, 6, NOW(), NOW()),
(8, 3, NOW(), NOW()),
(8, 8, NOW(), NOW()),
(8, 9, NOW(), NOW()),
(9, 4, NOW(), NOW()),
(9, 5, NOW(), NOW()),
(9, 6, NOW(), NOW()),
(9, 7, NOW(), NOW()),
(9, 8, NOW(), NOW()),
(9, 10, NOW(), NOW()),
(10, 5, NOW(), NOW()),
(10, 12, NOW(), NOW());

-- Insert sample data into events_hobbies
INSERT INTO events_hobbies (event_id, hobbie_id, created_at, updated_at) VALUES
(1, 1, NOW(), NOW()),
(2, 2, NOW(), NOW()),
(3, 5, NOW(), NOW()),
(4, 3, NOW(), NOW()),
(5, 4, NOW(), NOW());
