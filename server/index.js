import express from "express";
import { db } from './db.js';

const app = express();
app.use(express.json());
const PORT = 3000;

//get-users

app.get('/get-users', (req, res) => {
    const query = "SELECT * FROM users";
    db.query(query)
        .then(users => {
            res.status(200).json ({users: users.rows });
        });
});

app.post('/check-user', (req,res) => {
    const { username, password } = req.body;

    const query = " SELECT * FROM users WHERE username=$1 AND password=$2";
    db.query(query, [username, password])
    .then(result => {
        if (result.rowCount > 0) {
            res.status(200).json({exist: true});
        }
    
        else {
            res.status(200).json({ exist: false})
        }
    });
});

app.post('/register', (req,res) => {
    const { username, password, fname, lname } = req.body;

    const query = " INSERT INTO accounts (username, password, fname, lname) VALUES ($1, $2, $3, $4)"
    db.query(query, [username, password, fname, lname])
    .then(result => {
        res.status(200).json({success: true});
    })

});

app.get('/get-titles', (req, res) => {
    const query = "SELECT * FROM titles";
    db.query(query)
        .then(users => {
            res.status(200).json ({users: users.rows });
        });
});

app.get('/get-lists', (req, res) => {
    const query = "SELECT * FROM lists";
    db.query(query)
        .then(users => {
            res.status(200).json ({users: users.rows });
        });
});


app.get('/', (req,res) => {
    res.send('HELLO WORLD');
});

app.get('/to-do', (req,res) => {
    res.send('This is to do homepage');
});

app.post('/add-list', (req,res) => {
    //object destructing
    const {id, title_id, list_desc, status} = req.body;

    const query = " INSERT INTO lists (id, title_id, list_desc, status) VALUES ($1, $2, $3, $4)"
    db.query(query, [id, title_id, list_desc, status])
    .then(result => {
        res.status(200).json({success: true});
    })

}); 

app.post('/add-title', (req,res) => {
    //object destructing
    const {id, username, title, date_modified, status} = req.body;

    const query = " INSERT INTO titles (id, username, title, date_modified, status) VALUES ($1, $2, $3, $4, $5)"
    db.query(query, [id, username, title, date_modified, status])
    .then(result => {
        res.status(200).json({success: true});
    })

});  

app.post('/add-to-do', (req, res) => {
    const { username, title, lists, status } = req.body;
    const date_modified = new Date().toISOString();

    
    console.log("Request Body: ", req.body);

    
    if (!Array.isArray(lists) || lists.length === 0) {
        return res.status(400).json({ success: false, message: "Lists must be a non-empty array" });
    }

  
    const titleQuery = "INSERT INTO titles (username, title, date_modified, status) VALUES ($1, $2, $3, $4) RETURNING id";

    db.query(titleQuery, [username, title, date_modified, status])
      .then(result => {
          const title_id = result.rows[0].id;

        
          console.log("Inserted Title ID: ", title_id);

   
          const listQueries = lists.map((task, index) => {
              console.log(`Inserting list ${index + 1}:`, task); 
              return db.query("INSERT INTO list (title_id, list_desc, status) VALUES ($1, $2, $3)", [title_id, task, status]);
          });

          
          return Promise.all(listQueries);
      })
      .then(() => {
          res.status(200).json({ success: true, message: "To-Do List added successfully" });
      })
      .catch(error => {
          console.error(error);
          res.status(500).json({ success: false, message: "Error adding To-Do List" });
      });
});

  


    
app.post('/update-todo', (req, res) => {
    const { title_id, list } = req.body;
    const date_modified = new Date().toISOString().split('T')[0];

    const updateTitleQuery = "UPDATE titles SET date_modified = $1 WHERE id = $2";
    db.query(updateTitleQuery, [date_modified, title_id])
      .then(() => {
        const deleteListsQuery = "DELETE FROM lists WHERE title_id = $1";
        return db.query(deleteListsQuery, [title_id]);
      })
      .then(() => {
        const insertListQueries = list.map(task =>
          db.query("INSERT INTO lists (title_id, list_desc, status) VALUES ($1, $2, true)", [title_id, task])
        );
        return Promise.all(insertListQueries);
      })
      .then(() => {
        res.status(200).json({ success: true, message: "To-do Successfully Updated" });
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ success: false, message: "Error updating To-Do List" });
      });
});

app.post('/delete-todo', (req, res) => {
    const { title_id } = req.body;

    const deleteListsQuery = "DELETE FROM list WHERE title_id = $1";
    db.query(deleteListsQuery, [title_id])
      .then(() => {
        const deleteTitleQuery = "DELETE FROM titles WHERE id = $1";
        return db.query(deleteTitleQuery, [title_id]);
      })
      .then(() => {
        res.status(200).json({ success: true, message: "To-do Successfully Deleted" });
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ success: false, message: "Error deleting To-Do List" });
      });
});
   

app.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}`);
});