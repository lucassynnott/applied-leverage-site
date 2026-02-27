/**
 * MDX plugin configuration for applied-leverage.com blog posts.
 * Imports from shared @applied-leverage/mdx-pipeline package.
 */
import { getRemarkPlugins, rehypePlugins } from "@applied-leverage/mdx-pipeline";

// Blog uses default obsidian options: wikilinks → /adrs/, images → /images/
export const remarkPlugins = getRemarkPlugins();
export { rehypePlugins };
