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
   - Fill it with your credentials, you can find .env variables inside `.env.example`

5. **Set up the PostgreSQL database**:
    - Run `pnpm prestart` to create the creation table script inside `package.json`
    - Run `pnpm db:create` to create tables