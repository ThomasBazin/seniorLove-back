# seniorLove-back

## Installation

To run this project locally, follow these steps:

1. **Clone the repository**:

   ```sh
   git clone git@github.com:O-clock-Pavlova/seniorLove-back.git
   ```

2. **Navigate to the project directory**:

   ```sh
   cd DIRECTORYPATH/
   ```

3. **Install the dependencies**:

   ```sh
   pnpm install
   ```

4. **Setup the .env**

   - Create `.env` file
   - Add the PG_URL variable with your database credentials.

5. **Set up the PostgreSQL database**:

   - Create a new PostgreSQL database locally (only once)
   - Create tables and populate by running

     ```sh
     pnpm run db:reset
     ```

   ```

   ```

6. **Start the server**:

   ```sh
   npm run dev
   ```
