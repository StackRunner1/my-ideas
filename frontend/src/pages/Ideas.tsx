/**
 * Ideas Page
 * Session 3, Unit 12: Optimistic Updates & Advanced UX
 *
 * Full CRUD interface for managing ideas with:
 * - Optimistic UI updates
 * - Search and filtering
 * - Keyboard shortcuts
 * - Loading states and empty states
 */

import { useEffect, useState, useMemo, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setIdeas,
  setLoading,
  setError,
  addIdeaOptimistic,
  confirmIdeaCreated,
  revertIdeaCreation,
  updateIdeaOptimistic,
  confirmIdeaUpdated,
  revertIdeaUpdate,
  deleteIdeaOptimistic,
  confirmIdeaDeleted,
  revertIdeaDeletion,
  setSearchQuery,
  setStatusFilter,
  setTagFilter,
  clearFilters,
  Idea,
} from "@/store/ideasSlice";
import {
  getIdeas,
  createIdea,
  updateIdea,
  deleteIdea,
  CreateIdeaRequest,
  UpdateIdeaRequest,
} from "@/api/ideasApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/EmptyState";
import { ItemsListSkeleton } from "@/components/LoadingSkeleton";
import { parseAPIError } from "@/lib/errorHandler";
import {
  Search,
  Plus,
  Filter,
  X,
  Edit2,
  Trash2,
  Loader2,
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export default function Ideas() {
  const dispatch = useAppDispatch();
  const { items, loading, error, searchQuery, statusFilter, tagFilter } =
    useAppSelector((state) => state.ideas);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "archived">(
    "draft"
  );
  const [tags, setTags] = useState("");

  // Fetch ideas on mount
  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    dispatch(setLoading(true));
    try {
      const ideas = await getIdeas();
      dispatch(setIdeas(ideas));
    } catch (err) {
      const parsedError = parseAPIError(err);
      dispatch(setError(parsedError.message));
    }
  };

  // Filtered ideas based on search and filters
  const filteredIdeas = useMemo(() => {
    return items.filter((idea) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" || idea.status === statusFilter;

      // Tag filter
      const matchesTags =
        tagFilter.length === 0 ||
        tagFilter.some((tag) => idea.tags.includes(tag));

      return matchesSearch && matchesStatus && matchesTags;
    });
  }, [items, searchQuery, statusFilter, tagFilter]);

  // Get all unique tags from ideas
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach((idea) => {
      idea.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [items]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "/",
      onKeyDown: () => {
        searchInputRef.current?.focus();
      },
    },
    {
      key: "c",
      onKeyDown: () => {
        if (!isCreateDialogOpen && !isEditDialogOpen) {
          handleCreateClick();
        }
      },
    },
  ]);

  const handleCreateClick = () => {
    setTitle("");
    setDescription("");
    setStatus("draft");
    setTags("");
    setIsCreateDialogOpen(true);
  };

  const handleEditClick = (idea: Idea) => {
    setEditingIdea(idea);
    setTitle(idea.title);
    setDescription(idea.description);
    setStatus(idea.status);
    setTags(idea.tags.join(", "));
    setIsEditDialogOpen(true);
  };

  const handleCreateIdea = async () => {
    if (!title.trim()) return;

    setIsSubmitting(true);

    const tempId = `temp-${Date.now()}`;
    const optimisticIdea: Idea = {
      id: tempId,
      tempId,
      user_id: "pending",
      title,
      description,
      status,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      vote_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isPending: true,
    };

    // Optimistic update
    dispatch(addIdeaOptimistic(optimisticIdea));
    setIsCreateDialogOpen(false);

    try {
      const newIdea = await createIdea({
        title,
        description,
        status,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });

      // Confirm creation
      dispatch(confirmIdeaCreated({ tempId, realIdea: newIdea }));
    } catch (err) {
      // Revert on error
      dispatch(revertIdeaCreation(tempId));
      const parsedError = parseAPIError(err);
      alert(`Failed to create idea: ${parsedError.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateIdea = async () => {
    if (!editingIdea || !title.trim()) return;

    setIsSubmitting(true);

    const previousState = editingIdea;
    const updatedIdea: Idea = {
      ...editingIdea,
      title,
      description,
      status,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      updated_at: new Date().toISOString(),
    };

    // Optimistic update
    dispatch(updateIdeaOptimistic(updatedIdea));
    setIsEditDialogOpen(false);

    try {
      const result = await updateIdea(editingIdea.id, {
        title,
        description,
        status,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });

      // Confirm update
      dispatch(confirmIdeaUpdated(result));
    } catch (err) {
      // Revert on error
      dispatch(revertIdeaUpdate(previousState));
      const parsedError = parseAPIError(err);
      alert(`Failed to update idea: ${parsedError.message}`);
    } finally {
      setIsSubmitting(false);
      setEditingIdea(null);
    }
  };

  const handleDeleteIdea = async (idea: Idea) => {
    if (!confirm(`Delete "${idea.title}"?`)) return;

    // Optimistic delete
    dispatch(deleteIdeaOptimistic(idea.id));

    try {
      await deleteIdea(idea.id);
      // Confirm deletion
      dispatch(confirmIdeaDeleted(idea.id));
    } catch (err) {
      // Revert on error
      dispatch(revertIdeaDeletion(idea.id));
      const parsedError = parseAPIError(err);
      alert(`Failed to delete idea: ${parsedError.message}`);
    }
  };

  const hasActiveFilters =
    searchQuery || statusFilter !== "all" || tagFilter.length > 0;

  if (loading && items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold">My Ideas</h1>
        </div>
        <ItemsListSkeleton />
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">My Ideas</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive mb-4">
                Failed to load ideas: {error}
              </p>
              <Button onClick={fetchIdeas}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Ideas</h1>
          <p className="text-muted-foreground">
            Capture and organize your thoughts
          </p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="h-4 w-4 mr-2" />
          New Idea
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search ideas... (Press / to focus)"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) =>
                dispatch(
                  setStatusFilter(
                    e.target.value as "all" | "draft" | "published" | "archived"
                  )
                )
              }
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={() => dispatch(clearFilters())}
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Tag Filter Pills */}
          {allTags.length > 0 && (
            <div className="mt-4">
              <Label className="text-sm text-muted-foreground mb-2 block">
                Filter by tags:
              </Label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (tagFilter.includes(tag)) {
                        dispatch(
                          setTagFilter(tagFilter.filter((t) => t !== tag))
                        );
                      } else {
                        dispatch(setTagFilter([...tagFilter, tag]));
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      tagFilter.includes(tag)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ideas List */}
      {filteredIdeas.length === 0 ? (
        <EmptyState
          icon={<Lightbulb />}
          title={hasActiveFilters ? "No matching ideas" : "No ideas yet"}
          description={
            hasActiveFilters
              ? "Try adjusting your filters or search query"
              : "Start capturing your brilliant ideas by clicking 'New Idea'"
          }
          actionLabel={hasActiveFilters ? undefined : "Create First Idea"}
          onAction={hasActiveFilters ? undefined : handleCreateClick}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIdeas.map((idea) => (
            <Card
              key={idea.id}
              className={`transition-opacity ${
                idea.isPending ? "opacity-50" : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{idea.title}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(idea)}
                      disabled={idea.isPending}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteIdea(idea)}
                      disabled={idea.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {idea.description || "No description"}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {idea.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      idea.status === "published"
                        ? "bg-green-100 text-green-700"
                        : idea.status === "draft"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {idea.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Keyboard shortcuts:{" "}
          <kbd className="px-2 py-1 bg-secondary rounded">/</kbd> to search,{" "}
          <kbd className="px-2 py-1 bg-secondary rounded">C</kbd> to create
        </p>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Idea</DialogTitle>
            <DialogDescription>
              Capture your brilliant idea here
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter idea title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your idea"
                className="w-full px-3 py-2 border rounded-md min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as "draft" | "published" | "archived"
                  )
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="ai, productivity, mobile"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateIdea} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Idea</DialogTitle>
            <DialogDescription>Update your idea details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter idea title"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your idea"
                className="w-full px-3 py-2 border rounded-md min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as "draft" | "published" | "archived"
                  )
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
              <Input
                id="edit-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="ai, productivity, mobile"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateIdea} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
