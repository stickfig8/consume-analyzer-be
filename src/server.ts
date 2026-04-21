import { env } from "../src/configs/env.js";

import { app } from "../src/app.js";

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
