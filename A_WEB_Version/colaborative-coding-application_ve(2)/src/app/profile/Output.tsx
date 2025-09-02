import { useState } from "react";
import { Box, Button, Text, useToast } from "@chakra-ui/react";
import { executeCode } from "./api";

interface EditorRef {
  getValue: any; 
  current: {
    getValue: () => string; // Assuming the editor's getValue() method returns a string
    // Add other methods or properties as needed
  };
}

interface OutputProps {
  editorRef: React.RefObject<EditorRef>; // Use the defined type/interface here
  language: string; // Assuming language is a string
}
const Output: React.FC<OutputProps> = ({ editorRef, language }) => {
  const toast = useToast();
  const [output, setOutput] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const runCode = async () => {
    if (!editorRef.current) {
      console.error("Editor reference is null or undefined.");
      return;
    }
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;
    try {
      setIsLoading(true);
      const { run: result } = await executeCode(language, sourceCode);
      setOutput(result.output.split("\n"));
      result.stderr ? setIsError(true) : setIsError(false);
    } catch (error) {
      console.log(error);
      toast({
        title: "An error occurred.",
        description: "Unable to run code",
        status: "error",
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <Box w="50%">
      <Text mb={2} fontSize="lg">
        
      </Text>
      <Button
       
     
        mb={4}
        isLoading={isLoading}
        onClick={runCode}
        className="runcode"
      >
        Run Code
      </Button>
      <Box
        height="75vh"
        p={2}
        color={isError ? "red.400" : ""}
        border="1px solid"
        borderRadius={4}
        borderColor={isError ? "red.500" : "#333"}
      >
        {output
          ? output.map((line, i) => <Text key={i}>{line}</Text>)
          : <p className="clickme">'Click "Run Code" to see the output here'</p>}
      </Box>
    </Box>
    </>
  );
};
export default Output;
