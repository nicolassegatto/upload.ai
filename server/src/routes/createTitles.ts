import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { createReadStream } from "fs";
import { openai } from "../lib/openai";
import { OpenAIStream, streamToResponse } from "ai";



export async function createCompletionRoute(app: FastifyInstance) {
  app.post('/ai/complete', async (request, reply) => {

    const bodySchema = z.object({
      videoId: z.string().uuid(),
      prompt: z.string(),
      temperature: z.number().min(0).max(1).default(0.5),
    });

    const { videoId, prompt, temperature } = bodySchema.parse(request.body);

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId
      }
    });

    if(!video.transcript) {
      return reply.status(400).send({ error: 'Video does not have a transcript' });
    }

    const promptMessage = prompt.replace('{transcription}', video.transcript);

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-16k',
      temperature,
      messages: [
        { role: 'user', content: promptMessage}
      ],
      stream: true
    })

    const stream = OpenAIStream(response)

    streamToResponse(stream, reply.raw, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
      }
    })

  })
}