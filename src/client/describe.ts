/**
 * Localized model descriptions, shared by the /model popup rows and the
 * composer seat's model list.
 *
 * The Host advertises the built-in DeepSeek models with English prose; the
 * dictionary carries the localized copy. Provider-authored descriptions are
 * never rewritten: a built-in row is translated only while the advertised text
 * still equals the English dictionary entry.
 */
import type { ModelCatalogModel } from '@deepseek-ai/dsh-api-session-controller/types'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import { en, type ModelKey } from './locales.ts'

/** One selectable row's id: an opaque row key (resolved by lookup, never parsed). */
export function rowId(providerId: string, modelId: string): string {
  return `${providerId}/${modelId}`
}

/**
 * Built-in provider rows whose Host-advertised description is English prose
 * rather than provider-authored free text. Keyed by row id; the value names the
 * dictionary key carrying the localized copy.
 */
const BUILTIN_DESCRIPTION_KEYS: Record<string, ModelKey> = {
  'deepseek-official/deepseek-v4-flash': 'option.deepseekV4Flash.description',
  'deepseek-official/deepseek-v4-pro': 'option.deepseekV4Pro.description',
}

/**
 * Localize a model description, keeping provider-authored text verbatim.
 * @param providerId - the owning provider group id.
 * @param model - the advertised model.
 * @param t - the bound namespace translator.
 * @returns the description to render, or undefined when the model carries none.
 */
export function descriptionOf(
  providerId: string,
  model: ModelCatalogModel,
  t: TranslateNS<'model'>,
): string | undefined {
  const key = BUILTIN_DESCRIPTION_KEYS[rowId(providerId, model.id)]
  return key !== undefined && model.description === en[key] ? t(key) : model.description
}
