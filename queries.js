const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017';
const dbName = 'plp_bookstore';
const collectionName = 'books';

async function findBooks() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const books = await db.collection(collectionName).find().toArray();
    console.log(books);
  } finally {
    await client.close();
  }
}

findBooks().catch(console.error);
//  Write a query to find books that are both in stock and published after 2010
db.books.find({
  $and: [
    { in_stock: true },
    { published_year: { $gt: 2010 } }
  ]
})
// Use projection to return only the title, author, and price fields in your queries
db.books.find(
  { 
    in_stock: true, 
    published_year: { $gt: 2010 } 
  },
  { 
    _id: 0, 
    title: 1, 
    author: 1, 
    price: 1 
  }
)

// Implement sorting to display books by price (both ascending and descending)
db.books.find(
  {},
  { _id: 0, title: 1, author: 1, price: 1 }
).sort({ price: 1 })

db.books.find(
  {},
  { _id: 0, title: 1, author: 1, price: 1 }
).sort({ price: -1 })
// Use the `limit` and `skip` methods to implement pagination (5 books per page)
db.books.find(
  {},
  { _id: 0, title: 1, author: 1, price: 1 }
)
.sort({ title: 1 }) // optional: sort alphabetically or by price
.limit(5)
// Skip the first 5 books to get the next page
db.books.find(
  {},
  { _id: 0, title: 1, author: 1, price: 1 }
)
.sort({ title: 1 })
.skip(5)
.limit(5)
//page 3
db.books.find(
  {},
  { _id: 0, title: 1, author: 1, price: 1 }
)
.sort({ title: 1 })
.skip(10)
.limit(5)

// ### Task 4: Aggregation Pipeline
// Create an aggregation pipeline to calculate the average price of books by genre
db.books.aggregate([
  {
    $group: {
      _id: "$genre",
      averagePrice: { $avg: "$price" }
    }
  },
  {
    $project: {
      _id: 0,
      genre: "$_id",
      averagePrice: 1
    }
  }
])
// -Create an aggregation pipeline to find the author with the most books in the collection
db.books.aggregate([
  {
    $group: {
      _id: "$author",          // Group by author
      total_books: { $sum: 1 } // Count how many books each author has
    }
  },
  {
    $sort: { total_books: -1 } // Sort by count, highest first
  },
  {
    $limit: 1                  // Keep only the top author
  }
])

// Implement a pipeline that groups books by publication decade and counts them
db.books.aggregate([
  {
    $project: {
      decade: {
        $concat: [
          { $substr: [ { $toString: "$published_year" }, 0, 3 ] },
          "0s"
        ]
      }
    }
  },
  {
    $group: {
      _id: "$decade",
      total_books: { $sum: 1 }
    }
  },
  {
    $sort: { _id: 1 } // Sort decades in ascending order
  }
])

// ### Task 5: Indexing
// - Create an index on the `title` field for faster searches
db.books.createIndex({ title: 1 })
// - Create a compound index on `author` and `published_year`
db.books.createIndex({ author: 1, published_year: 1 })
// - Use the `explain()` method to demonstrate the performance improvement with your indexes
db.books.find({ title: "1984" }).explain("executionStats")




