import { Hono } from 'hono'
import { cors } from 'hono/cors';
import { nanoid } from 'nanoid'


//D1 Database
//Need to integrate authentication
type Bindings = {
  DB: D1Database;
};


//structure for RequestDataUI for /requests
type RequestDataUI = {
    message: string;
    receiver_id: string;
    skills: string;
    user_id: string;
    skill_id: string;
  };


//Structure for /users
type User = {
  username: string;
  email: string;
  password: string;
};


//Skills structure for /skills
type Skill = {
  name: string;

};

//Structure for /user_skills
type UserSkill = {
  user_id:string;
  skill_id:string;
  rating: number;
};
type UserSkillUI = {
  user_id:string;
  skill:string;
};


const app = new Hono<{ Bindings: Bindings }>();
//Never forget to add the database binding 
//it really took me a while to figure out why the database was not working

//cors Middleware only allows locolhost:5173 to access the server
app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: ['http://localhost:5173'],
    allowMethods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
  return await corsMiddleware(c, next)
})


app.get('/', (c) => {
  return c.text('Hello Hono!')
})


app.post('/users', async (c) => {
  try {
    const { username, email, password }: User = await c.req.json();

    // Check if the user already exists in the database
    const existingUserRes = await c.env.DB.prepare(
      `SELECT * FROM users WHERE username = ? OR email = ?`
    ).bind(username, email).all();

    const existingUser = existingUserRes.results;

    if (existingUser.length > 0) {
      return c.json({ error: "User already exists" });
    }

    const user_id = nanoid(8);

    // Insert the new user
    const result = await c.env.DB.prepare(
      `INSERT INTO users (user_id, username, email, password) VALUES (?,?,?,?)`
    ).bind(user_id, username, email, password).run();

    return c.json({ message: "User created successfully", user_id });
  } catch (error) {
    const message = (error as Error).message;

    if (message.includes("UNIQUE constraint failed: users.user_id")) {
      return c.json({ error: "User ID already exists" });
    }
    if (message.includes("UNIQUE constraint failed: users.username")) {
      return c.json({ error: "Username already exists" });
    }
    if (message.includes("UNIQUE constraint failed: users.email")) {
      return c.json({ error: "Email already exists" });
    }

    return c.json({ error: `Unexpected error: ${message}` });
  }
});


app.post('/login', async (c) => {
  try {
    const { emailOrUsername, password }: { emailOrUsername: string, password: string } = await c.req.json();
    const response = await c.env.DB.prepare(
      `SELECT * FROM users WHERE email = ? OR username = ?`
    ).bind(emailOrUsername, emailOrUsername).all();

    const user = response.results && response.results[0];

    if (!user) {
      return c.json({ username: '', isCorrectPassword: 0, message: 'User not found' });
    }

    const isCorrectPassword = user.password === password ? 1 : 0;
    const message = isCorrectPassword ? 'Password is correct' : 'Password is incorrect';
    return c.json({ username: user.user_id, isCorrectPassword, message });
  } catch (error) {
    console.error('Error:', error); // Log the error
    return c.json({ username: '', isCorrectPassword: 0, message: `Error logging in: ${error}` });
  }
});


//needed to post the skills
app.post('/skills', async (c) => {
  try {
    const { name }:Skill = await c.req.json();

    const randomid = nanoid(8)

    // Add the skill to the database using parameterized query
    const {success } = await c.env.DB.prepare(
      `INSERT INTO skills (skill_id, name, description) VALUES (?,?,?)`
    ).bind(randomid, name, randomid).run();

    // Check if the insertion was successful
    if (success) {
      return c.json({ message: "Skill created successfully" });
    } else {
      return c.json({ error: "Error adding skill" });
    }
  } catch (error) {
    return c.json({ error: `Error adding skill: ${error}` });
  }
});



app.post('/requests-db/sql/new', async (c) => {
  try {
    // Extract request data from the incoming request body
    const { requester_id, receiver_id, skill_id, message } = await c.req.json();

    // Add the request to the database
    const result = await c.env.DB.prepare(
      `INSERT INTO requests (requester_id, receiver_id, skill_id, message) VALUES (?,?,?,?)`
    ).bind(requester_id, receiver_id, skill_id, message).run();

    // Check if the insertion was successful
    if (result) {
      return c.json({ message: "Request added successfully" });
    } else {
      return c.json({ error: "Error adding request" });
    }
  } catch (error) {
    return c.json({ error: `Error adding request: ${error}` });
  }
});


app.post('/user_skills', async (c) => {
  try {
    const { user_id, skill_id, rating }: UserSkill = await c.req.json();

    // Add the user skill to the database using parameterized query
    const result = await c.env.DB.prepare(
      `INSERT INTO user_skills (user_id, skill_id, rating) VALUES (?,?,?)`
    ).bind(user_id, skill_id, rating).run();

    // Check if the insertion was successful
    if (result) {
      return c.json({ message: "User skill added successfully" });
    } else {
      return c.json({ error: "Error adding user skill" });
    }
  } catch (error) {
    return c.json({ error: `Error adding user skill: ${error}` });
  }
});

//Home page to display all the user skills
app.get('/user_skills/:id', async (c) => {
  try {
    const id: string = c.req.param('id');
    // Retrieve user skills with user details and skill names from the database
    const userSkills = await c.env.DB.prepare(`
      SELECT us.user_id, u.username, us.skill_id, s.name AS skill_name, us.rating
      FROM user_skills us
      INNER JOIN users u ON us.user_id = u.user_id
      INNER JOIN skills s ON us.skill_id = s.skill_id
      WHERE us.user_id != ?
    `).bind(id).all();    

    return c.json(userSkills);
  } catch (error:any) {
    return c.json({ error: `Error fetching user skills: ${error.message}` });
  }
});

app.get('/getskills', async (c) => {
  try {
    // Query the database for all skills
    const skills = await c.env.DB.prepare(
      `SELECT * FROM skills`
    ).all();

    // Return the skills as a JSON response
    return c.json(skills);
  } catch (error) {
    return c.json({ error: `Error fetching skills: ${error}` });
  }
});

app.post('/res', async (c) => {
  try {
    const { status, receiver_id, skill_id, requester_id } = await c.req.json();

    if (!skill_id) {
      return c.json({ error: "Missing required skill_id", skill_id });
    }
    if (!requester_id) {
      return c.json({ error: "Missing required requester_id", requester_id });
    }

    if (!receiver_id) {
      return c.json({ error: "Missing required receiver_id", receiver_id });
    }

    if (status === true) {
      // Update the status to "approved" for the original request
      const result1 = await c.env.DB.prepare(`
        UPDATE requests
        SET status = "approved"
        WHERE receiver_id = ? AND skill_id = ? AND requester_id = ?
      `).bind(receiver_id, skill_id, requester_id).run();

      // Insert a new request with the reversed roles and the same skill_id
      // Check if the requester has the skill in their user_skills table
      const {results} = await c.env.DB.prepare(
        `SELECT * FROM user_skills WHERE user_id = ? AND skill_id = ?`
      ).bind(requester_id, skill_id).all();
      
      if (results.length === 0) {
        // Add the skill to the user_skills table for the requester
        const resultUserSkill = await c.env.DB.prepare(
          `INSERT INTO user_skills (user_id, skill_id) VALUES (?, ?)`
        ).bind(requester_id, skill_id).run();
        
        if (!resultUserSkill) {
          return c.json({ error: "Error adding user skill" });
        }
      }
      
      // Insert a new request with the reversed roles and the same skill_id
      const result2 = await c.env.DB.prepare(`
        INSERT INTO requests (requester_id, receiver_id, skill_id, status)
        VALUES (?, ?, ?, "approved")
      `).bind(receiver_id, requester_id, skill_id).run();
    } else {
      // Delete the original request
      const result = await c.env.DB.prepare(`
        DELETE FROM requests
        WHERE skill_id = ? AND receiver_id = ? AND requester_id = ?
      `).bind(skill_id, receiver_id, requester_id).run();
      return c.json({ message: "Request deleted successfully" });
    }

    return c.json({ message: "Requests updated successfully" });
  } catch (error: any) {
    return c.json({ error: `Error updating request: ${error.message}` });
  }
});

//To give a request and to insert the value into the server d1 database
app.post('/requests', async (c) => {

  try {
    const { message, receiver_id, skills, skill_id,user_id }: RequestDataUI = await c.req.json();
  
    // Iterate over each skill ID
    if (!message ) {
      return c.json({ error: "Missing required meg" });
    }
    if ( !receiver_id ) {
      return c.json({ error: "Missing required re" });
    }
    if ( !skills ) {
      return c.json({ error: "Missing required skill" });
    }
    if ( !user_id ) {
      return c.json({ error: "Missing required userid" });
    }
    if ( !skill_id ) {
      return c.json({ error: "Missing required skillid" });
    }

    const status = "pending";
  
    // Check if the requester has already made a request to the receiver
    const existingRequest = await c.env.DB.prepare(
      `SELECT * FROM requests WHERE requester_id = ? AND receiver_id = ? AND skill_id = ?`
    ).bind(user_id, receiver_id, skill_id).all() ;

    if (existingRequest.results.length > 0) {
      return c.json({ error: "You have already made a request to this Person" });
    }

    // Add the request to the database
    const result = await c.env.DB.prepare(
      `INSERT INTO requests (requester_id, receiver_id, skill_id, message, status) VALUES (?, ?, ?, ?, ?)`
    ).bind(user_id, receiver_id, skill_id, message, status).run();

    // Check if the insertion was successful
    if (result) {
      return c.json({ message: "Request added successfully" });
    } else {
      return c.json({ error: "Error adding request" });
    }
  
  } catch (error:any) {

    return c.json({ error: `Error adding request: ${error.message}` });
    
  }
});



app.get('/requests/:receiver_id', async (c) => {
  try {
    const receiver_id: string = c.req.param('receiver_id');

    // Prepare the SQL query to retrieve requests with requester details and skill names
    const stmt = await c.env.DB.prepare(
      `SELECT DISTINCT r.requester_id, u.username AS requester_name, r.message, s.name AS requester_skills,s.skill_id
       FROM requests r 
       INNER JOIN users u ON r.requester_id = u.user_id
       INNER JOIN user_skills us ON r.requester_id = us.user_id
       INNER JOIN skills s ON r.skill_id = s.skill_id
       WHERE r.receiver_id = ? AND r.status!="approved"`
    );

    // Bind the receiver_id to the prepared statement
    const boundStmt = stmt.bind(receiver_id);

    // Execute the prepared statement and fetch all results
    const requests = await boundStmt.all();

    return c.json(requests);
  } catch (error:any) {
    return c.json({ error: `Error fetching requests: ${error.message}` });
  }
});


app.get('/requestsfriend/:user_id', async (c) => {
  try {
    const user_id: string = c.req.param('user_id');

    const stmt = c.env.DB.prepare(
      `SELECT DISTINCT r.requester_id, u.username AS requester_name, r.message, s.name AS requester_skills, s.skill_id, r.status
       FROM requests r 
       INNER JOIN users u ON r.requester_id = u.user_id
       INNER JOIN user_skills us ON r.requester_id = us.user_id
       INNER JOIN skills s ON r.skill_id = s.skill_id
       WHERE ((r.receiver_id = ? AND r.status="approved") OR (r.requester_id = ? AND r.status="approved")) AND r.requester_id != ?`
    );

    const boundStmt = stmt.bind(user_id, user_id,user_id);
    const requests = await boundStmt.all();

    return c.json(requests);
  } catch (error:any) {
    return c.json({ error: `Error fetching requests: ${error.message}` });
  }
});



// Get all skills from the skills table
app.get('/getskills', async (c) => {
  try {
    // Query the database for all skills
    const skills = await c.env.DB.prepare(
      `SELECT * FROM skills`
    ).all();
    // Return the skills as a JSON response
    return c.json(skills);
  } catch (error) {
    return c.json({ error: `Error fetching skills: ${error}` });
  }
});


app.get('/getskills/:user_id', async (c) => {
  try {
    const user_id: string = c.req.param('user_id');
    const skills = await c.env.DB.prepare(
      `SELECT u.username AS user_name, s.name AS skill_name
       FROM user_skills us
       JOIN users u ON us.user_id = u.user_id
       JOIN skills s ON us.skill_id = s.skill_id
       WHERE us.user_id = ?`
    ).bind(user_id).all();
    
    return c.json(skills);
  } catch (error) {
    return c.json({ error: `Error fetching skills: ${error}` });
  }
});



app.post('/user_skillsUI', async (c) => {
  try {
    const { user_id, skill }: UserSkillUI = await c.req.json();

    const existingSkill = await c.env.DB.prepare(
      `SELECT skill_id FROM skills WHERE name = ?`
    ).bind(skill).all();

    let skill_id;

    if (existingSkill.results.length > 0) {
      skill_id = existingSkill.results[0].skill_id;
    } else {
      skill_id = nanoid(5);
      const randomdescription = nanoid(3);
      await c.env.DB.prepare(
        `INSERT INTO skills (skill_id, name, description) VALUES (?, ?, ?)`
      ).bind(skill_id, skill, randomdescription).run();
    }

    await c.env.DB.prepare(
      `INSERT INTO user_skills (user_id, skill_id) VALUES (?, ?)`
    ).bind(user_id, skill_id).run();

    return c.json({ message: "User skill added successfully" });
  } catch (error) {
    return c.json({ error: `Error adding user skill: ${error}` });
  }
});





// Remove Approved Friend Request and Add Rating
app.post('/requests/respond', async (c) => {
  try {
    const { requester_id, receiver_id, skill_id, rating } = await c.req.json();

    // Remove the approved request
    const deleteResult = await c.env.DB.prepare(`
      DELETE FROM requests
      WHERE requester_id = ? AND receiver_id = ? AND skill_id = ? AND status = 'approved'
    `).bind(receiver_id,requester_id , skill_id).run();

    // Check if the deletion was successful
    if (!deleteResult) {
      return c.json({ error: "Error removing friend request" });
    }

    // Add or update rating for the receiver
    const {results} = await c.env.DB.prepare(`
      SELECT rating FROM user_skills WHERE user_id = ? AND skill_id = ?
    `).bind(receiver_id, skill_id).all();
    
    
    let newRating = 0;
    if (results.length > 0) {
      const existingRating = results[0].rating;
      // Calculate new rating by averaging existing rating and new rating
      newRating = (Number(existingRating) + Number(rating)) / 2;
      await c.env.DB.prepare(`
        UPDATE user_skills SET rating = ? WHERE user_id = ? AND skill_id = ?
      `).bind(newRating, receiver_id, skill_id).run();
    }  else {
      // If no existing rating, simply add the new rating
      newRating = rating;
      await c.env.DB.prepare(`
        INSERT INTO user_skills (user_id, skill_id, rating) VALUES (?, ?, ?)
      `).bind(receiver_id, skill_id, newRating).run();
    }

    return c.json({ message: "Friend request removed and rating updated successfully", newRating });
  } catch (error:any) {
    return c.json({ error: `Error handling friend request: ${error.message}` });
  }
});

export default app
// Add a new user skill to the user_skills table
