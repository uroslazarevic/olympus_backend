import _ from 'lodash';
/* USED FOR CACHING AND IMPROVING SPEED OF QUERIES:
    before =>   we execute query for every boardId, it was like > 7 individual queries
    after =>    we execute one query that looks like:

        Executing (default): SELECT "id", "text", "createdAt", "updatedAt",
        "creatorId", "boardId" FROM "suggestions" AS "suggestion" WHERE
        "suggestion"."boardId" IN (2, 3, 4, 6, 7, 8);

    result =>   we can call multiple same queries but the response
                is cached and the response speed is drasticly decreased
*/
export default async function batchSuggestions(keys, { Suggestion }) {
    // keys = [1,2,3...]
    const suggestions = await Suggestion.findAll({ raw: true, where: { boardId: keys } });

    // suggestions = [{boardId:1, text:'hi'}, {boardId:2, , text:'bye'},  {boardId:2, , text:'bye2'}]
    const groupedSuggs = _.groupBy(suggestions, 'boardId');

    // keys =>{[{boardId:1, text:'hi'}], [{boardId:2, , text:'bye'},  {boardId:2, , text:'bye2'}]}
    const mappedkeys = keys.map((k) => groupedSuggs[k] || []);

    return mappedkeys;
}
