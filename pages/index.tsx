import { APIKeyInput } from '@/components/APIKeyInput';
import { AddStoryNodeButton } from '@/components/AddStoryNodeButton';
import { GenerateStoryButton } from '@/components/GenerateStoryButton';
import { Loader } from '@/components/Loader';
import { ResetStoryButton } from '@/components/ResetStoryButton';
import { StoryNodes } from '@/components/StoryNodes';
import { OpenAIModel, StoryNode } from '@/types';
import { generateStoryNode } from '@/utils/app';
import { IconKey } from '@tabler/icons-react';
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const [model, setModel] = useState<OpenAIModel>('gpt-3.5-turbo');
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);

  const [storyNodes, setStoryNodes] = useState<StoryNode[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingIndex, setLoadingIndex] = useState<number>(0);
  const [lastNode, setLastNode] = useState<StoryNode>();

  const linkRef = useRef<HTMLAnchorElement>(null);

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    localStorage.setItem('apiKey', value);
  };

  const handleAddStoryNode = (index: number) => {
    setStoryNodes((prevStoryNodes) => {
      const newStoryNodes = [...prevStoryNodes];
      if (index === 0) {
        newStoryNodes.unshift({
          name: '',
          description: '',
          summary: '',
          script: '',
        });
      } else {
        newStoryNodes.splice(index, 0, {
          name: '',
          description: '',
          summary: '',
          script: '',
        });
      }

      localStorage.setItem('storyNodes', JSON.stringify(newStoryNodes));
      return newStoryNodes;
    });
  };

  const handleUpdateStoryNode = (index: number, storyNode: StoryNode) => {
    setStoryNodes((prevStoryNodes) => {
      const newStoryNodes = [...prevStoryNodes];
      newStoryNodes[index] = storyNode;
      localStorage.setItem('storyNodes', JSON.stringify(newStoryNodes));
      return newStoryNodes;
    });
  };

  const handleRemoveStoryNode = (index: number) => {
    setStoryNodes((prevStoryNodes) => {
      const newStoryNodes = [...prevStoryNodes];
      newStoryNodes.splice(index, 1);

      if (newStoryNodes.length === 0) {
        newStoryNodes.push({
          name: '',
          description: '',
          summary: '',
          script: '',
        });
      }

      localStorage.setItem('storyNodes', JSON.stringify(newStoryNodes));
      return newStoryNodes;
    });
  };

  const handleResetStory = () => {
    const proceed = confirm('Are you sure you want to reset the story?');

    if (!proceed) {
      return;
    }

    setStoryNodes([{ name: '', description: '', summary: '', script: '' }]);

    localStorage.removeItem('storyNodes');
  };

  const handleGenerateNode = async (
    node: StoryNode,
    index: number,
    context: { summary: string; script: string },
  ) => {
    const generatedNode = await generateStoryNode(node, context, model, apiKey);

    if (generatedNode) {
      handleUpdateStoryNode(index, generatedNode);
    } else {
      alert(`Failed to generate block ${index + 1}.`);
    }

    return generatedNode;
  };

  const handleGenerateStory = async () => {
    const invalidNodes = storyNodes.filter(
      (node) => node.name === '' || node.description === '',
    );

    if (invalidNodes.length > 0) {
      alert('Please fill in the name and description for every scene.');
      return;
    }

    setLoading(true);

    let context = {
      summary: '',
      script: '',
    };

    let nodes: StoryNode[] = [];

    for (let i = 0; i < storyNodes.length; i++) {
      setLoadingIndex(i);

      const isLastNode = i === storyNodes.length - 1;
      if (isLastNode) {
        context.summary = `${context.summary}\n\nThis is the final scene.`;
      }

      const generatedNode = await handleGenerateNode(storyNodes[i], i, context);

      if (!generatedNode) {
        alert(`Failed to generate block ${i + 1}.`);
        setLoading(false);
        return;
      }

      nodes.push(generatedNode);
      setLastNode(generatedNode);

      context.summary = `${context.summary} ${generatedNode?.summary}`.slice(
        -4000,
      );
      context.script = `${context.script} ${generatedNode?.script}`.slice(
        -4000,
      );
    }

    downloadScript(nodes);

    setLoading(false);
  };

  const downloadScript = (nodes: StoryNode[]) => {
    if (linkRef.current) {
      let text = '';
      text = nodes
        .map(
          (node) =>
            `Scene Name:\n${node.name}\n\nScene Description:\n${node.description}\n\nScene Summary:\n${node.summary}\n\nScene Script:\n${node.script}\n\n\n`,
        )
        .join('');

      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      linkRef.current.href = url;
      linkRef.current.download = `storyboard-ai-${new Date().toISOString()}.txt`;
      linkRef.current.click();
    }
  };

  useEffect(() => {
    const apiKey = localStorage.getItem('apiKey');
    if (apiKey) {
      setApiKey(apiKey);
      setShowApiKeyInput(false);
    } else {
      setShowApiKeyInput(true);
    }

    const storyNodes = localStorage.getItem('storyNodes');
    if (storyNodes) {
      setStoryNodes(JSON.parse(storyNodes));
    } else {
      setStoryNodes([{ name: '', description: '', summary: '', script: '' }]);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Storyboard AI</title>
        <meta
          name="description"
          content="An AI powered storyboard tool for creatives."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-full min-h-screen flex-col items-center bg-gradient-to-b from-indigo-500 to-indigo-700 px-2 pb-10 text-neutral-200 sm:px-10">
        <div className="mt-10 text-4xl">Storyboard AI</div>

        <div className="mt-6">
          {showApiKeyInput ? (
            <APIKeyInput
              apiKey={apiKey}
              onChange={handleApiKeyChange}
              onSet={() => setShowApiKeyInput(!showApiKeyInput)}
            />
          ) : (
            <div className="absolute right-3 top-3 sm:right-10 sm:top-5">
              <IconKey
                className="h-7 w-7 cursor-pointer hover:opacity-50 sm:h-[30px] sm:w-[30px]"
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              />
            </div>
          )}
        </div>

        {!showApiKeyInput &&
          (loading ? (
            <div className="mt-4">
              <Loader
                index={loadingIndex}
                total={storyNodes.length}
                lastNode={lastNode}
              />
            </div>
          ) : (
            <div className="flex w-[350px] flex-col items-center sm:w-[800px]">
              <div className="flex w-[320px] justify-between">
                <ResetStoryButton onResetStory={handleResetStory} />

                <GenerateStoryButton onGenerateStory={handleGenerateStory} />
              </div>

              <div className="mb-2 mt-5 w-[600px] border-b" />

              <div className="flex flex-col items-center">
                <div className="mt-4">
                  <AddStoryNodeButton
                    onAddStoryNode={() => handleAddStoryNode(0)}
                  />
                </div>

                <div className="mt-4 w-[350px] sm:w-[600px]">
                  <StoryNodes
                    storyNodes={storyNodes}
                    onUpdateStoryNode={handleUpdateStoryNode}
                    onRemoveStoryNode={handleRemoveStoryNode}
                    onAddStoryNode={handleAddStoryNode}
                  />
                </div>
              </div>
            </div>
          ))}
        <a ref={linkRef} style={{ display: 'none' }} href="/" download />
      </main>
    </>
  );
}
