CALL apoc.load.json("file:///j_coordinates.json")
YIELD value
MERGE (c: Coordinate{lng:value.coordinates.properties.lng,lat:value.coordinates.properties.lat})
