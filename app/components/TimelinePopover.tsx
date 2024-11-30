import React from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Box,
  Text,
  Tag,
  HStack,
} from '@chakra-ui/react';

interface TimelineItemProps {
  id: string;
  type: 'vision' | 'bhag' | 'milestone';
  content: string;
  target_date: string;
  completed?: boolean;
}

interface TimelinePopoverProps {
  item: TimelineItemProps;
  children: React.ReactNode;
}

export const TimelinePopover: React.FC<TimelinePopoverProps> = ({ item, children }) => {
  const getColorScheme = (type: string) => {
    switch (type) {
      case 'vision':
        return 'purple';
      case 'bhag':
        return 'blue';
      default:
        return 'indigo';
    }
  };

  return (
    <Popover>
      <PopoverTrigger>
        {children}
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>
          <HStack justify="space-between">
            <Tag size="sm" colorScheme={getColorScheme(item.type)}>
              {item.type.toUpperCase()}
            </Tag>
            {item.completed && (
              <Tag size="sm" colorScheme="green">Completed</Tag>
            )}
          </HStack>
        </PopoverHeader>
        <PopoverBody>
          <Box>
            <Text mb={2}>{item.content}</Text>
            <Text fontSize="sm" color="gray.600">
              {item.completed
                ? `Completed on ${new Date().toLocaleDateString()}`
                : `Target: ${new Date(item.target_date).toLocaleDateString()}`}
            </Text>
          </Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
