import Image from "next/image";
import { AppBar, Box, Card, Button, Container, Toolbar } from "@mui/material";

const TRANSLATE_URL = "http://localhost:3000/api/translate";
interface FromWord {
  text: string;
  definition: string;
  pos2: string;
  fr2: string;
}
interface ToWord {
  text: string;
  pos2: string;
  dsense: string;
}
interface Translation {
  from_word: FromWord;
  to_words: ToWord[];
  translation_id: number;
}
const TranslationCard = ({ translation }: { translation: Translation }) => {
  return <Card></Card>;
};
const ResponseComponent = async () => {
  "use client";

  const body = new URLSearchParams({
    direction: "enes",
    word: "hi",
  });
  console.log("Body:", body.toString());
  const url = `${TRANSLATE_URL}?${body.toString()}`;
  const myjson: { translations: Translation[] } = await fetch(url).then(
    (response) => response.json()
  );
  console.log("asdfasdfasdf");
  console.log(myjson);
  return (
    <>
      {myjson.translations.map((translation) => (
        <TranslationCard
          key={translation.translation_id}
          translation={translation}
        />
      ))}
    </>
  );
};
export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <Box>
        <Box>
          <AppBar position="sticky">
            <Container>
              <Toolbar>
                <Image src="/icon.png" alt="Logo" width={50} height={50} />
              </Toolbar>
            </Container>
          </AppBar>
        </Box>
      </Box>
      <ResponseComponent></ResponseComponent>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
