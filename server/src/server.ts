import {fastify} from "fastify";
import { getAllPrompts } from "./routes/getAllPrompts";
import { uploadVideoRoute } from "./routes/uploadVideo";
import { createTranscriptionRoute } from "./routes/createTranscription";
import { createCompletionRoute } from "./routes/createTitles";
import fastifyCors from "@fastify/cors";

const app = fastify()

app.register(fastifyCors, {
  origin: '*'
})

app.register(getAllPrompts)
app.register(uploadVideoRoute)
app.register(createTranscriptionRoute)
app.register(createCompletionRoute)

app.listen({ port: 3333 }).then(() => {
  console.log('Server is running on port 3333')
})