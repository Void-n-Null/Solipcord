/**
 * Service for cleaning message content by removing XML-like tags
 */
export class MessageCleanserService {
  /**
   * Remove a specific tag and its content from the text
   * Handles both properly paired tags and orphaned closing tags
   */
  private removeTagWithContent(content: string, tagName: string): string {
    const escapedTag = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let cleaned = content;

    // Step 1: Remove properly paired tags first
    const tagPattern = new RegExp(
      `<${escapedTag}(?:\\s[^>]*)?>.*?</${escapedTag}>|<${escapedTag}(?:\\s[^>]*)?/>`,
      'gs'
    );
    cleaned = cleaned.replace(tagPattern, '');

    // Step 2: Handle orphaned closing tags
    const closingTagPattern = new RegExp(`</${escapedTag}>`, 'g');
    while (closingTagPattern.test(cleaned)) {
      const closingMatch = cleaned.match(new RegExp(`^(.*?)</${escapedTag}>`, 's'));
      if (closingMatch) {
        cleaned = cleaned.substring(closingMatch[0].length);
      } else {
        break;
      }
    }

    return cleaned;
  }

  /**
   * Clean message content by removing XML-like tags
   * @param content - The message content to clean
   * @param tagsToHideContent - Optional array of tag names whose content should be removed entirely
   * @returns Cleaned message content
   *
   * @example
   * // Remove tags but keep content
   * cleanMessage('<test>Hi</test> There') // Returns: 'Hi There'
   *
   * @example
   * // Remove tags and hide content of specific tags
   * cleanMessage('<test>Hi</test> There', ['test']) // Returns: ' There'
   *
   * @example
   * // Handle orphaned closing tags (no opening tag)
   * cleanMessage('Hello there </message>', ['message']) // Returns: ''
   */
  cleanMessage(content: string, tagsToHideContent: string[] = []): string {
    return this.cleanMessageWithOptions(content, { tagsToHideContent, removeAllTags: true });
  }

  /**
   * Clean message content with custom tag configurations
   * @param content - The message content to clean
   * @param options - Configuration options
   * @returns Cleaned message content
   */
  cleanMessageWithOptions(
    content: string,
    options: {
      tagsToHideContent?: string[];
      removeAllTags?: boolean;
    } = {}
  ): string {
    const { tagsToHideContent = [], removeAllTags = true } = options;
    let cleaned = content;

    // Remove tags and their content for specified tags
    for (const tagName of tagsToHideContent) {
      cleaned = this.removeTagWithContent(cleaned, tagName);
    }

    // Remove all remaining tags if configured
    if (removeAllTags) {
      cleaned = cleaned.replace(/<\/?[^>]+>/g, '');
    }

    return cleaned;
  }
}

// Singleton instance
export const messageCleanser = new MessageCleanserService();
