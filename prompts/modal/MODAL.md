# Modal

app/components/CreateWorkspaceModal.tsx and app/components/InviteUserModal.tsx have the same structure, so we can create a generic modal component that can be used for both.

The component should be created in app/components/ui/Modal.tsx

## Props

children: React.ReactNode
title: string
onClose: () => void
isOpen: boolean
description?: string
