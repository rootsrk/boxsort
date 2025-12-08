'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { generateFunkyName } from '@/lib/utils/name-generator'

interface AddBoxDialogProps {
  onAddBox: (funkyName: string) => Promise<void>
  trigger?: React.ReactNode
}

export function AddBoxDialog({ onAddBox, trigger }: AddBoxDialogProps) {
  const [open, setOpen] = useState(false)
  const [funkyName, setFunkyName] = useState(() => generateFunkyName())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleRegenerate() {
    setFunkyName(generateFunkyName())
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    try {
      await onAddBox(funkyName)
      setOpen(false)
      setFunkyName(generateFunkyName()) // Reset for next time
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create box')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {trigger || (
          <Button>
            <span className="mr-2">+</span>
            Add Box
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Box</DialogTitle>
          <DialogDescription>
            Create a new box with an auto-generated funky name. You can regenerate the name if you
            don&apos;t like it.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {error && (
            <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Box Name</label>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 p-3 bg-muted rounded-md font-mono text-lg">{funkyName}</div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleRegenerate}
                  disabled={loading}
                  title="Regenerate name"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M8 16H3v5" />
                  </svg>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Click the refresh button to generate a different name
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Box'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

