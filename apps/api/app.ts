import config from "@/config/config";
import logger from "@/utils/logger";
import { createServer } from "./server";

const port = config.PORT;
const server = createServer();

server.listen(port, () => {
  logger.info(`Api server running on ${port}`);
});
