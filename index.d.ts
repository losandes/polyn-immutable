// Type definitions for @polyn/blueprint
// Project: https://github.com/losandes/polyn-blueprint
// Definitions by: Andy Wright <https://github.com/losandes>
// TypeScript Version: 2.1
import { IValueOrError } from '@polyn/blueprint';

export interface IValidatedImmutable<T> {
  patch (input: any): T;
  toObject (options?: { removeFunctions?: boolean }): any;
}

export interface IValidate {
  validate (input: any): IValueOrError | void
}

export interface IConfig {
  Validator (name: string, schema: any): IValidate
}

export interface IArrayUtils {
  push (newEntry: any): any[]
  pop (): any[]
  shift (): any[]
  unshift (newEntry: any): any[]
  sort (compareFunction: Function): any[]
  reverse (): any[]
  splice (start: number, deleteCount: number, ...items: any): any[]
  remove (index: number): any[]
  copy (): any[]
}

/**
 * Creates a Validator (@polyn/blueprint by default) and returns a
 * function for creating new instances of objects that get validated
 * against the given schema. All of the properties on the returned
 * value are immutable
 * @curried
 * @param {string|blueprint} name - the name of the immutable, or an existing blueprint
 * @param {object} schema - the blueprint schema
 */
export function immutable<T> (name: string, schema: any): new (...a: any[]) => T;

/**
 * Create your own instance of `immutable`, passing in configuration, such as
 * a custom implementation of `IValidate`.
 * @curried
 * @param {IConfig} config - the options for this instance of immutable
 * @param {string|blueprint} name - the name of the immutable, or an existing blueprint
 * @param {object} schema - the blueprint schema
 */
export function Immutable (config: IConfig):
  <T>(name: string, schema: any) => new (...a: any[]) => T;

/**
 * Use functions that normally mutate an array with immutable equivalents
 * @param anArray - the array you want to patch/merge into a new array
 */
export function array (anArray: any[]): IArrayUtils;
