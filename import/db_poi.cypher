CALL apoc.load.json("file:///j_poi_location.json")
YIELD value
MERGE (p:POI{
  name:value.p.start.properties.name,
  id:value.p.start.properties.id,
  location:point({latitude:value.p.end.properties.lat,longitude:value.p.end.properties.lng,crs:'wgs-84'})
})
