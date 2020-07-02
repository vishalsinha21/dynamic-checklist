const Checklist = require('./checklist')

describe('should test newly added lines', () => {

  test('should return blank for blank input', () => {
    const result = Checklist.getOnlyAddedLines('');
    expect(result).toBe('');
  });

  test('should return null for null input', () => {
    const result = Checklist.getOnlyAddedLines(null);
    expect(result).toBe(null);
  });

  test('should return only added line', () => {
    const diff = '+ added line1\n'
        + '- removed line1\n'
        + '+ added line2\n'
        + '- removed line2\n';

    const expectedResult = '+ added line1\n'
        + '+ added line2\n';

    const result = Checklist.getOnlyAddedLines(diff);
    expect(result).toBe(expectedResult);
  });

})


describe('should return checklist creation', () => {

  test('should return empty array', () => {
    const result = Checklist.getChecklist('', []);
    expect(result).toStrictEqual([]);
  });

  test('should return empty array', () => {
    const diff = 'nothing matching in this diff'
    const mapping = [
      {
        "keywords": ["create index", "createIndex"],
        "comment": "Indexes have been created concurrently in big tables"
      },
      {
        "keywords": ["connection", "session", "CloseableHttpClient", "HttpClient"],
        "comment": "Resources have been closed in finally block or using try-with-resources"
      }
    ]

    const result = Checklist.getChecklist(diff, mapping);
    expect(result).toStrictEqual([]);
  });

  test('should return comment for create index', () => {
    const diff = 'create index order_number_customer_id'
    const mapping = [
      {
        "keywords": ["create index", "createIndex"],
        "comment": "Indexes have been created concurrently in big tables"
      },
      {
        "keywords": ["connection", "session", "CloseableHttpClient", "HttpClient"],
        "comment": "Resources have been closed in finally block or using try-with-resources"
      }
    ]

    const result = Checklist.getChecklist(diff, mapping);
    expect(result).toStrictEqual(["Indexes have been created concurrently in big tables"]);
  });

  test('should return comment for create index even if multiple matches for same', () => {
    const diff = 'create index order_number_customer_id\n' + 'createIndex'
    const mapping = [
      {
        "keywords": ["create index", "createIndex"],
        "comment": "Indexes have been created concurrently in big tables"
      },
      {
        "keywords": ["connection", "session", "CloseableHttpClient", "HttpClient"],
        "comment": "Resources have been closed in finally block or using try-with-resources"
      }
    ]

    const result = Checklist.getChecklist(diff, mapping);
    expect(result).toStrictEqual(["Indexes have been created concurrently in big tables"]);
  });

  test('should return comment for all matching keyword', () => {
    const diff = 'create index order_number_customer_id\n' + 'Connection connection = new Connection()'
    const mapping = [
      {
        "keywords": ["create index", "createIndex"],
        "comment": "Indexes have been created concurrently in big tables"
      },
      {
        "keywords": ["connection", "session", "CloseableHttpClient", "HttpClient"],
        "comment": "Resources have been closed in finally block or using try-with-resources"
      },
      {
        "keywords": ["RequestMapping", "GetMapping", "PostMapping", "PutMapping"],
        "comment": "Endpoint URLs exposed by application use only small case"
      },
      {
        "keywords": ["keyword1", "keyword2"],
        "comment": "Expert comment"
      }
    ]

    const result = Checklist.getChecklist(diff, mapping);
    expect(result).toStrictEqual(["Indexes have been created concurrently in big tables",
      "Resources have been closed in finally block or using try-with-resources"]);
  });

})

describe('should test formatting of check list', () => {

  test('should return blank for empty checklist array', () => {
    const result = Checklist.getFormattedChecklist([]);
    expect(result).toBe('');
  });

  test('should return formatted checklist', () => {
    const checklist = ["Indexes have been created concurrently in big tables",
      "Resources have been closed in finally block or using try-with-resources"];

    const expectedResult = "**Checklist:**\n"
        + "- [ ] Indexes have been created concurrently in big tables\n"
        + "- [ ] Resources have been closed in finally block or using try-with-resources"

    const result = Checklist.getFormattedChecklist(checklist);
    expect(result).toBe(expectedResult);
  });

})

describe('should test final check list', () => {

  test('should return final checklist', () => {
    const diff = 'create index order_number_customer_id\n' + 'Connection connection = new Connection()'
    const mapping = [
      {
        "keywords": ["create index", "createIndex"],
        "comment": "Indexes have been created concurrently in big tables"
      },
      {
        "keywords": ["connection", "session", "CloseableHttpClient", "HttpClient"],
        "comment": "Resources have been closed in finally block or using try-with-resources"
      },
      {
        "keywords": ["RequestMapping", "GetMapping", "PostMapping", "PutMapping"],
        "comment": "Endpoint URLs exposed by application use only small case"
      },
      {
        "keywords": ["keyword1", "keyword2"],
        "comment": "Expert comment"
      }
    ]
    const expectedResult = "**Checklist:**\n"
        + "- [ ] Indexes have been created concurrently in big tables\n"
        + "- [ ] Resources have been closed in finally block or using try-with-resources"

    const result = Checklist.getFinalChecklist(diff, mapping);
    expect(result).toBe(expectedResult);
  });

  test('should handle null values gracefully', () => {
    const result = Checklist.getFinalChecklist(null, null);
    expect(result).toBe("");
  });

  test('should handle empty diff and mapping gracefully', () => {
    const result = Checklist.getFinalChecklist('', []);
    expect(result).toBe("");
  });


})