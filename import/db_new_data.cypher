
MATCH (a) -[r] -> () DELETE a, r;
MATCH (a) DELETE a;


LOAD CSV WITH HEADERS FROM "file:///user.csv" AS person
WITH person
CREATE (:User{
  userName: person.userName,
  firstName: person.firstName,
  lastName: person.lastName,
  email: person.email,
  password: "$2a$10$Sb4ENJN7DR6zdDh.IUyB5OoKCfVPRvOSqciWp/9j9Ql/8NIHiqUKG"
});

LOAD CSV WITH HEADERS FROM "file:///pois.csv" AS POI
FIELDTERMINATOR ';'
WITH POI
CREATE (:POI{name:  POI.name, id: POI.name}) - [:LOCATED_AT] -> (:Coordinates{lat:toFloat(POI.Y), lng:toFloat(POI.X)});

LOAD CSV WITH HEADERS FROM "file:///journeys.csv" as  j
FIELDTERMINATOR ';'
MATCH
(start:Coordinates{lat:toFloat(j.startlat),lng:toFloat(j.startlng)}),
(end:Coordinates{lat:toFloat(j.endlat),lng:toFloat(j.endlng)})
WITH start,end, split(j.experiences,",") as array,j
MATCH (user:User{userName:j.creator})
CREATE (start) <- [:START]-(journey:Journey{ id:j.id, title:j.title}) - [:END] -> (end)
CREATE   (journey) <- [:CREATED] - (user)
WITH array,journey,RANGE(0,size(array)-1) as ids,j
UNWIND RANGE(0,size(array)-1) as i
MATCH 
(e:POI{id:array[i]})
CREATE   (journey) - [:EXPERIENCE{order:i}] -> (e)

