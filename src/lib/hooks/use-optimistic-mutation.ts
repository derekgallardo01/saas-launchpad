"use client";

import { useCallback, useRef, useState } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Configuration for an optimistic mutation.
 *
 * @template TData   - The shape of the cached data
 * @template TInput  - The mutation input type
 */
interface OptimisticMutationOptions<TData, TInput> {
  /** The React Query / tRPC query key to optimistically update */
  queryKey: readonly unknown[];

  /**
   * Produce the next cache state given the current data and the mutation input.
   * Return `undefined` to skip the optimistic update.
   */
  updater: (current: TData | undefined, input: TInput) => TData | undefined;

  /**
   * The actual async mutation function (e.g. `trpc.member.invite.mutate`).
   */
  mutationFn: (input: TInput) => Promise<unknown>;

  /**
   * Optional callback fired on a successful mutation.
   */
  onSuccess?: (input: TInput) => void;

  /**
   * Optional callback fired when the mutation fails and the cache is rolled back.
   * Defaults to `console.error`. Integrate your toast library here.
   */
  onError?: (error: unknown, input: TInput) => void;

  /**
   * Whether to invalidate the query after a successful mutation.
   * Defaults to `true`.
   */
  invalidateOnSuccess?: boolean;
}

interface OptimisticMutationResult<TInput> {
  /** Fire the mutation with optimistic update. */
  mutate: (input: TInput) => Promise<void>;
  /** `true` while the underlying async mutation is in-flight. */
  isPending: boolean;
  /** The error from the most recent failed mutation, or `null`. */
  error: unknown | null;
}

/**
 * A generic hook for tRPC-compatible optimistic mutations.
 *
 * Instantly updates the React Query cache, then fires the real mutation.
 * On failure, the cache is rolled back to the previous snapshot.
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useOptimisticMutation({
 *   queryKey: [["member", "list"], { input: { orgId }, type: "query" }],
 *   updater: (members, newMember) => [...(members ?? []), newMember],
 *   mutationFn: (input) => trpc.member.invite.mutate(input),
 *   onError: (err) => toast.error("Failed to invite member"),
 * });
 * ```
 */
export function useOptimisticMutation<TData, TInput>(
  options: OptimisticMutationOptions<TData, TInput>,
): OptimisticMutationResult<TInput> {
  const {
    queryKey,
    updater,
    mutationFn,
    onSuccess,
    onError = (err) => console.error("[optimistic-mutation] rolled back:", err),
    invalidateOnSuccess = true,
  } = options;

  const queryClient: QueryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  // Store the latest callbacks in a ref so the `mutate` identity is stable.
  const latestRef = useRef(options);
  latestRef.current = options;

  const mutate = useCallback(
    async (input: TInput) => {
      setIsPending(true);
      setError(null);

      // 1. Cancel any in-flight refetches so they don't overwrite our optimistic data.
      await queryClient.cancelQueries({ queryKey });

      // 2. Snapshot the current cache state for rollback.
      const previousData = queryClient.getQueryData<TData>(queryKey);

      // 3. Optimistically apply the update.
      const nextData = updater(previousData, input);
      if (nextData !== undefined) {
        queryClient.setQueryData<TData>(queryKey, nextData);
      }

      try {
        // 4. Execute the real mutation.
        await mutationFn(input);

        // 5. Invalidate so the cache resyncs with the server.
        if (invalidateOnSuccess) {
          await queryClient.invalidateQueries({ queryKey });
        }

        onSuccess?.(input);
      } catch (err) {
        // 6. Roll back to the previous snapshot.
        queryClient.setQueryData<TData>(queryKey, previousData);
        setError(err);
        onError(err, input);
      } finally {
        setIsPending(false);
      }
    },
    // queryKey is serialized — use JSON for stable identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryClient, JSON.stringify(queryKey), updater, mutationFn, onSuccess, onError, invalidateOnSuccess],
  );

  return { mutate, isPending, error };
}
