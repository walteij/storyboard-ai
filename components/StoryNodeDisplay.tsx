import { StoryNode } from '@/types';
import { FC } from 'react';

interface Props {
  storyNode: StoryNode;
  onUpdateStoryNode?: (storyNode: StoryNode) => void;
}

export const StoryNodeDisplay: FC<Props> = ({
  storyNode,
  onUpdateStoryNode,
}) => {
  return (
    <div
      className="w-full whitespace-pre-line rounded border border-white
    p-4"
    >
      <div className="border-b pb-4">
        <div className="font-bold">Scene Name</div>
        {onUpdateStoryNode ? (
          <input
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-indigo-500 focus:outline-none"
            placeholder="Enter the scene name."
            value={storyNode.name}
            onChange={(e) =>
              onUpdateStoryNode({ ...storyNode, name: e.target.value })
            }
          />
        ) : (
          <div className="mt-1">
            {storyNode.name ? storyNode.name : 'No name available.'}
          </div>
        )}
      </div>

      <div className="mt-4 border-b pb-4">
        <div className="font-bold">Scene Description</div>
        {onUpdateStoryNode ? (
          <textarea
            className="mt-1 h-[200px] w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-indigo-500 focus:outline-none"
            style={{ resize: 'none' }}
            placeholder="Describe the scene."
            value={storyNode.description}
            onChange={(e) =>
              onUpdateStoryNode({ ...storyNode, description: e.target.value })
            }
          />
        ) : (
          <div className="mt-1">
            {storyNode.description
              ? storyNode.description
              : 'No description available.'}
          </div>
        )}
      </div>

      <div className="mt-4 border-b pb-4">
        <div className="font-bold">Scene Summary</div>
        <div className="mt-1">
          {storyNode.summary ? storyNode.summary : 'No summary available.'}
        </div>
      </div>

      <div className="mt-4 pb-4">
        <div className="font-bold">Scene Screenplay</div>
        <div className="mt-1">
          {storyNode.script ? storyNode.script : 'No script available.'}
        </div>
      </div>
    </div>
  );
};
